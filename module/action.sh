#!/bin/bash
# shellcheck disable=SC2154
# INFO: The module's Action button: a short status report. Settings live in the WebUI.
MODDIR=${0%/*}
SUSFS_BIN=/data/adb/ksu/bin/susfs
PERSISTENT_DIR=/data/adb/nextsusfs

prop() { grep "^$1=" "${MODDIR}/module.prop" | cut -d'=' -f2-; }
count() { if [[ -f "$1" ]]; then grep -cvE '^[[:space:]]*(#|$)' "$1"; else echo 0; fi; }

susfs_version=$(${SUSFS_BIN} show version 2>/dev/null)
features=$(${SUSFS_BIN} show enabled_features 2>/dev/null)

echo "N E X T S U S F S  $(prop version)"
echo "Kernel-level root hiding for the NEXT stack"
echo ""

if [[ "${susfs_version}" == "v2"* ]]; then
	echo "Status:   Active ✅"
elif [[ "${susfs_version}" == "v1"* ]]; then
	echo "Status:   Old SuSFS ⚠️ (v2 recommended)"
else
	echo "Status:   No SuSFS in this kernel ❌"
	echo "          Flash a SuSFS-patched kernel to start hiding."
fi
echo "SuSFS:    ${susfs_version:-none}"
echo "Features: $(printf '%s\n' "${features}" | grep -c .)/9"
echo "Kernel:   $(uname -r)"
echo "Device:   $(getprop ro.product.manufacturer) $(getprop ro.product.model) · Android $(getprop ro.build.version.release)"
echo ""

echo "NEXT stack"
for m in treat_wheel:NextWheel rezygisk:NextZygisk; do
	id=${m%%:*}; name=${m#*:}
	if [[ ! -d "/data/adb/modules/${id}" ]]; then state="not installed"
	elif [[ -f "/data/adb/modules/${id}/disable" ]]; then state="disabled"
	else state="installed ✅"; fi
	printf '  %-11s %s\n' "${name}" "${state}"
done
echo ""

echo "Your lists"
printf '  %-24s %s\n' "Hidden paths" "$(count "${PERSISTENT_DIR}/custom_sus_path.txt")"
printf '  %-24s %s\n' "Re-hidden paths" "$(count "${PERSISTENT_DIR}/custom_sus_path_loop.txt")"
printf '  %-24s %s\n' "Hidden from memory maps" "$(count "${PERSISTENT_DIR}/custom_sus_map.txt")"
printf '  %-24s %s\n' "Unmounted for apps" "$(count "${PERSISTENT_DIR}/custom_kernel_umount.txt")"
printf '  %-24s %s\n' "Open redirect" "$(count "${PERSISTENT_DIR}/custom_open_redirect.txt")"
echo ""
echo "Open the WebUI to change settings."
