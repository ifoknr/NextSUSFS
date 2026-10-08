#!/bin/bash
# shellcheck disable=SC2154
KSU_BIN=/data/adb/ksud
KSU_MODULES_DIR=/data/adb/modules
SUSFS_BIN=/data/adb/ksu/bin/susfs
PERSISTENT_DIR=/data/adb/nextsusfs
DEST_BIN_DIR=/data/adb/ksu/bin

# Load utils
[[ -e "${MODPATH}/utils.sh" ]] && source "${MODPATH}/utils.sh"

ui_print ""
ui_print "   N E X T S U S F S"
ui_print "   Kernel-level root hiding for the NEXT stack"
ui_print ""

# INFO: SuSFS is a KernelSU-family feature; it cannot work on Magisk/other roots.
if [[ -z "${KSU}" ]]; then
	abort '[❌] NextSUSFS needs KernelSU or a KernelSU fork (ReSukiSU, etc.).'
fi

# INFO: Pick the userspace tool for this device's CPU instead of arm64 only, so the
#         module installs on every architecture like NextWheel and NextZygisk.
case "${ARCH}" in
	arm64) SUSFS_ARCH=arm64-v8a ;;
	arm)   SUSFS_ARCH=armeabi-v7a ;;
	x64)   SUSFS_ARCH=x86_64 ;;
	x86)   SUSFS_ARCH=x86 ;;
	*)     abort "[❌] Unsupported CPU: ${ARCH}" ;;
esac
ui_print "[✅] Device CPU: ${ARCH} (${SUSFS_ARCH})"

if [[ -f "${MODPATH}/tools/susfs_bin/${SUSFS_ARCH}" ]]; then
	cp -f "${MODPATH}/tools/susfs_bin/${SUSFS_ARCH}" "${MODPATH}/tools/susfs"
fi
rm -rf "${MODPATH}/tools/susfs_bin"

if [[ ! -d "${DEST_BIN_DIR}" ]]; then
	abort "[❌] '${DEST_BIN_DIR}' does not exist; is KernelSU set up?"
fi

cp -f "${MODPATH}/tools/susfs" "${DEST_BIN_DIR}"
chmod +x "${MODPATH}/inotify.sh"
chmod 755 "${DEST_BIN_DIR}/susfs"
ln -sf "${DEST_BIN_DIR}/susfs" "${DEST_BIN_DIR}/sus"       # For development
ln -sf "${DEST_BIN_DIR}/susfs" "${DEST_BIN_DIR}/ksu_susfs" # For compatibility

# INFO: SuSFS only works when the kernel is patched with it. Instead of aborting on a
#         plain kernel (so the module can be shipped generically), install anyway and let
#         the WebUI report that the kernel is missing SuSFS, the same way NextWheel reports
#         when Zygisk is not running. "no_kernel" is read by the WebUI.
susfs_version=$(${SUSFS_BIN} show version 2>/dev/null)
if [[ "${susfs_version}" == "v2"* ]]; then
	ui_print "[✅] SuSFS in kernel: ${susfs_version}"
	kernel_state="ok"
elif [[ "${susfs_version}" == "v1"* ]]; then
	ui_print "[⚠️] Old SuSFS in kernel: ${susfs_version} (v2 recommended)"
	kernel_state="old"
else
	ui_print "[⚠️] No SuSFS detected in this kernel."
	ui_print "     NextSUSFS installs, but it can only hide once you flash a"
	ui_print "     SuSFS-patched kernel. The WebUI will show this."
	kernel_state="no_kernel"
fi

ui_print "[✅] Preparing data directory (${PERSISTENT_DIR})"
mkdir -p "${PERSISTENT_DIR}"
echo "${kernel_state}" > "${PERSISTENT_DIR}/kernel_state"

# Reset module description
susfs_features_number=$(${SUSFS_BIN} show enabled_features 2>/dev/null | wc -l)
kernel_version=$(cat /proc/version | awk '{print $3}' | grep -oE '^[0-9]+\.[0-9]+\.[0-9]+')
status="Waiting for reboot ⏱️"
${KSU_BIN} module config set override.description "[Status: ${status} | Kernel: ${kernel_version} | SuSFS: ${susfs_version:-none} | Features: ${susfs_features_number}/9] NextSUSFS" 2>/dev/null

# INFO: Only one SuSFS driver may own the kernel at a time, so turn off any other,
#         including the module this is forked from, to avoid two of them fighting.
for other in susfs4ksu susfs_manager brene ReSuSFS; do
	[[ -e "${KSU_MODULES_DIR}/${other}" ]] && {
		touch "${KSU_MODULES_DIR}/${other}/disable" && ui_print "[✅] Disabled other SuSFS module: ${other}"
	}
done

files="
custom_sus_map.txt
custom_kernel_umount.txt
custom_sus_path.txt
custom_sus_path_loop.txt
custom_open_redirect.txt
custom_sus_kstat.txt
"
for file in ${files}; do
	if [[ ! -f "${PERSISTENT_DIR}/${file}" ]]; then
		touch "${PERSISTENT_DIR}/${file}" && ui_print "[✅] Added ${file}"
	fi
done

if [[ ! -f "${PERSISTENT_DIR}/config.sh" ]]; then
	cp "${MODPATH}/config.sh" "${PERSISTENT_DIR}" && ui_print '[✅] Added config.sh'
else
	while IFS='=' read -r key value || [[ -n "${key}" ]]; do
		[[ -z "${key// /}" || "${key// /}" == "#"* ]] && continue
		if grep -q "^${key}=" "${PERSISTENT_DIR}/config.sh"; then
			:
		else
			echo "${key}=${value}" >> "${PERSISTENT_DIR}/config.sh"
			ui_print "[➕] Added missing key: ${key}"
		fi
	done < "${MODPATH}/config.sh"
fi

update_config_date 2>/dev/null

[[ -d "${PERSISTENT_DIR}/fake_files" ]] && rm -rf "${PERSISTENT_DIR}/fake_files"

# Reset boot-loop protection so a fresh (re)install starts from a clean slate.
rm -f "${PERSISTENT_DIR}/boot_attempts" "${PERSISTENT_DIR}/safe_mode"

# INFO: No "WebUI without reboot" shortcut here. Copying the module into
#         /data/adb/modules and deleting MODPATH while the manager is still installing
#         left only a few files on some managers: no webroot (WebUI hangs) and no
#         boot-completed.sh (status stuck on "Waiting for reboot"). The manager moves the
#         module into place on the next boot.

ui_print '[✅] NextSUSFS installed. Reboot to apply.'
