#!/bin/bash
# shellcheck disable=SC2154
PATH=/data/adb/ksu/bin:$PATH
MODDIR=${0%/*}
KSU_BIN=/data/adb/ksud
KSU_MODULES_DIR=/data/adb/modules
SUSFS_BIN=/data/adb/ksu/bin/susfs
PERSISTENT_DIR=/data/adb/nextsusfs
DEST_BIN_DIR=/data/adb/ksu/bin

## brene_clone_perm <file/or/dir/perm/to/be/changed> <file/or/dir/to/clone/from>
brene_clone_perm() {
	# Always use busybox to maintain consistency
	TO=$1
	FROM=$2

	if [[ -z "${TO}" ]] || [[ -z "${FROM}" ]]; then
		return
	fi

	read -r permission owner group < <(busybox stat -c "%a %U %G" "${FROM}")

	busybox chmod "${permission}" "${TO}"
	busybox chown "${owner}":"${group}" "${TO}"
	busybox chcon --reference="${FROM}" "${TO}"
}

# susfs_list_full_file_access_for_third_party_apps() {
# 	local TARGET_PERMISSION="android.permission.MANAGE_EXTERNAL_STORAGE"
# 	pm list packages -3 | cut -d':' -f2 | while read -r PKGNAME; do
# 		if pm dump-package "${PKGNAME}" | grep -Eq "${TARGET_PERMISSION}"; then
# 			echo "susfs: package '${PKGNAME}' has '${TARGET_PERMISSION}' permission declared." | tee /dev/kmsg
# 		fi
# 	done
# }

PROP_BACKUP="${PERSISTENT_DIR}/prop_backup.txt"

# Remember a property's real value the first time we change it, so the WebUI can put the
# real value back without a reboot. One "name<TAB>value" line per property, written once.
save_original_prop() {
	local PROP_NAME=$1 CURRENT_VALUE=$2
	[[ -z "${PROP_NAME}" ]] && return
	grep -q "^${PROP_NAME}	" "${PROP_BACKUP}" 2> /dev/null && return
	printf '%s\t%s\n' "${PROP_NAME}" "${CURRENT_VALUE}" >> "${PROP_BACKUP}"
}

# Put every spoofed property back to its saved real value (no reboot) and clear the
# backup. Called from the WebUI when the user turns the spoofing off.
restore_original_props() {
	[[ -e "${PROP_BACKUP}" ]] || return
	while IFS=$'\t' read -r name value; do
		[[ -z "${name}" ]] && continue
		resetprop -n "${name}" "${value}"
	done < "${PROP_BACKUP}"
	resetprop -c --force 2> /dev/null
	rm -f "${PROP_BACKUP}"
}

# Record whether this is a custom ROM or the stock one, for the WebUI and the Action button.
# Runs early in post-fs-data, before "Remove Custom ROM Properties" deletes the evidence.
# Writes "type=custom|stock" plus "name=<rom>" (when known) and "reason=<what matched>".
ROM_TYPE_FILE="${PERSISTENT_DIR}/rom_type"
detect_rom_type() {
	local name="" reason=""
	name=$(resetprop | awk -F'[][]' '{print $2}' | grep -ioE "${CUSTOM_ROM_NAMES}" | head -n 1)
	[[ -z "${name}" ]] && name=$(resetprop ro.build.flavor | grep -ioE "${CUSTOM_ROM_NAMES}" | head -n 1)
	if [[ -n "${name}" ]]; then
		reason="props"
	elif [[ -n "$(resetprop ro.modversion)" ]]; then
		reason="ro.modversion"
	elif [[ "$(resetprop ro.build.tags)" == *"test-keys"* ]]; then
		reason="test-keys"
	elif [[ -d /system/addon.d ]]; then
		reason="addon.d"
	fi

	if [[ -n "${reason}" ]]; then
		printf 'type=custom\nname=%s\nreason=%s\n' "$(echo "${name}" | tr '[:upper:]' '[:lower:]')" "${reason}" > "${ROM_TYPE_FILE}"
	else
		printf 'type=stock\nname=\nreason=\n' > "${ROM_TYPE_FILE}"
	fi
}

resetprop_n() {
	save_original_prop "$1" "$(resetprop "$1")"
	resetprop -n "$1" "$2"
}

if_prop_exits_resetprop_n() {
	local PROP_NAME=$1
	local NEW_VALUE=$2
	local CURRENT_VALUE
	CURRENT_VALUE=$(resetprop "${PROP_NAME}")

	[[ -z "${CURRENT_VALUE}" ]] || [[ "${CURRENT_VALUE}" == "${NEW_VALUE}" ]] || {
		save_original_prop "${PROP_NAME}" "${CURRENT_VALUE}"
		resetprop -n "${PROP_NAME}" "${NEW_VALUE}"
	}
}

# if_contains_resetprop_n() {
# 	local PROP_NAME=$1
#   local CONTAINS_VALUE=$2
#   local NEW_VALUE=$3

#   [[ "$(resetprop ${PROP_NAME})" = *"${CONTAINS_VALUE}"* ]] && resetprop -n "${PROP_NAME}" "${NEW_VALUE}"
# }

spoof_system_properties() {
	if_prop_exits_resetprop_n "ro.secure" "1"
	if_prop_exits_resetprop_n "ro.debuggable" "0"
	if_prop_exits_resetprop_n "ro.adb.secure" "1"
	if_prop_exits_resetprop_n "persist.sys.usb.config" "mtp"
	if_prop_exits_resetprop_n "ro.boot.verifiedbootstate" "green"
	if_prop_exits_resetprop_n "ro.boot.flash.locked" "1"
	if_prop_exits_resetprop_n "ro.boot.veritymode" "enforcing"
	if_prop_exits_resetprop_n "ro.boot.avb_version" "1.3"
	if_prop_exits_resetprop_n "ro.build.type" "user"
	if_prop_exits_resetprop_n "ro.build.tags" "release-keys"
	if_prop_exits_resetprop_n "ro.build.keys" "release-keys"
	if_prop_exits_resetprop_n "ro.crypto.state" "encrypted"
	if_prop_exits_resetprop_n "ro.allow.mock.location" "0"
	if_prop_exits_resetprop_n "ro.boot.warranty_bit" "0"
	if_prop_exits_resetprop_n "ro.warranty_bit" "0"
	if_prop_exits_resetprop_n "ro.force.debuggable" "0"
	if_prop_exits_resetprop_n "ro.secureboot.devicelock" "1"
	if_prop_exits_resetprop_n "ro.secureboot.lockstate" "locked"
	if_prop_exits_resetprop_n "ro.is_ever_orange" "0"
	if_prop_exits_resetprop_n "ro.bootmode" "normal"
	if_prop_exits_resetprop_n "vendor.boot.verifiedbootstate" "green"
	if_prop_exits_resetprop_n "ro.vendor.boot.warranty_bit" "0"
	if_prop_exits_resetprop_n "ro.vendor.warranty_bit" "0"
	if_prop_exits_resetprop_n "init.svc.adbd" "stopped"
	if_prop_exits_resetprop_n "init.svc_debug_pid.adbd" ""
	if_prop_exits_resetprop_n "ro.oem_unlock_supported" "0"

	# Realme
	if_prop_exits_resetprop_n "ro.boot.realme.lockstate" "1"
	if_prop_exits_resetprop_n "ro.boot.realmebootstate" "green"

	resetprop_n "ro.boot.vbmeta.size" "$(blockdev --getsize64 "/dev/block/by-name/vbmeta$(resetprop ro.boot.slot_suffix)")"
	resetprop_n "ro.boot.vbmeta.avb_version" "1.3"
	resetprop_n "ro.boot.vbmeta.hash_alg" "sha256"
	resetprop_n "ro.boot.vbmeta.device_state" "locked"
	resetprop_n "ro.boot.vbmeta.invalidate_on_error" "yes"
	resetprop_n "vendor.boot.vbmeta.device_state" "locked"

	## Delete some prop names for newer pixel device ##
	resetprop -d "ro.boot.verifiedbooterror"
	resetprop -d "ro.boot.verifyerrorpart"
	resetprop -d "vendor.boot.verifyerrorpart"
	resetprop -d "vendor.boot.verifiedbooterror"
	resetprop -d "crashrecovery.rescue_boot_count"

	resetprop -d "service.adb.root"
	resetprop -d "service.adb.tcp.port"

	# https://android.googlesource.com/platform/frameworks/base/+/bab174bf0883cbc5039a2860a1af706a56fe6ca0%5E%21/
	if [[ "$(resetprop ro.build.version.sdk)" -ge "36" ]]; then
		resetprop -d "sys.oem_unlock_allowed"
	else
		if_prop_exits_resetprop_n "sys.oem_unlock_allowed" "0"
	fi

	resetprop -c --force
}

spoof_fingerprint_properties() {
	fingerprint_value=$(resetprop ro.build.fingerprint)
	new_fingerprint_value="${fingerprint_value//userdebug/user}"
	new_fingerprint_value="${new_fingerprint_value//evolution/}"
	new_fingerprint_value="${new_fingerprint_value//crdroid/}"
	new_fingerprint_value="${new_fingerprint_value//lineage/}"
	if_prop_exits_resetprop_n "ro.bootimage.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.odm.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.odm_dlkm.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.product.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.system.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.system_dlkm.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.system_ext.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.vendor.build.fingerprint" "${new_fingerprint_value}"
	if_prop_exits_resetprop_n "ro.vendor_dlkm.build.fingerprint" "${new_fingerprint_value}"
}

# INFO: Custom ROM build identity. ROMs ship fingerprints and build strings like
#         "google/lineage_cheetah/cheetah:15/AP4A.250105.002/eng.root.20251001:userdebug/test-keys".
#         Turn every dirty one into a single consistent stock-looking identity:
#         product without the ROM prefix, a numeric incremental, user/release-keys. Clean
#         values (often the OEM's own vendor fingerprint) are left alone.
is_dirty_build_value() {
	echo "$1" | grep -iqE "test-keys|dev-keys|userdebug|/eng\.|:eng/|^eng\.|${CUSTOM_ROM_NAMES}"
}

# Strip a "<rom>_" prefix (lineage_cheetah -> cheetah)
strip_rom_prefix() {
	local value=$1 lower name
	lower=$(echo "${value}" | tr '[:upper:]' '[:lower:]')
	for name in ${CUSTOM_ROM_NAMES//|/ }; do
		case "${lower}" in "${name}_"*) echo "${value#*_}"; return ;; esac
	done
	echo "${value}"
}

clean_build_identity() {
	local fp prefix rest brand product device release id incr
	local clean_product clean_incr clean_fp p key val
	fp=$(resetprop ro.build.fingerprint)
	[[ -z "${fp}" ]] && return
	is_dirty_build_value "${fp}" || return

	# brand/product/device:release/id/incremental:type/tags
	prefix=${fp%%:*}
	rest=${fp#*:}
	brand=${prefix%%/*}
	device=${prefix##*/}
	product=${prefix#*/}
	product=${product%/*}
	release=${rest%%/*}
	rest=${rest#*/}
	id=${rest%%/*}
	incr=${rest#*/}
	incr=${incr%%:*}

	clean_product=$(strip_rom_prefix "${product}")
	[[ -z "${clean_product}" ]] && clean_product=${device}
	clean_incr=${incr}
	if is_dirty_build_value "/${incr}"; then
		# Prefer the real build number from a clean OEM fingerprint of the same release and
		# build id (vendor/odm often keep the stock one), else the build date as a number.
		clean_incr=""
		for key in ro.vendor.build.fingerprint ro.odm.build.fingerprint ro.bootimage.build.fingerprint; do
			val=$(resetprop "${key}")
			[[ -z "${val}" ]] && continue
			is_dirty_build_value "${val}" && continue
			case "${val}" in *":${release}/${id}/"*) ;; *) continue ;; esac
			val=${val#*":${release}/${id}/"}
			clean_incr=${val%%:*}
			break
		done
		[[ -z "${clean_incr}" ]] && clean_incr=$(resetprop ro.build.date.utc)
		[[ -z "${clean_incr}" ]] && clean_incr=$(date +%s)
	fi
	clean_fp="${brand}/${clean_product}/${device}:${release}/${id}/${clean_incr}:user/release-keys"

	for p in "" system. system_ext. product. odm. vendor. vendor_dlkm. odm_dlkm. system_dlkm. bootimage.; do
		key="ro.${p}build.fingerprint"
		val=$(resetprop "${key}")
		[[ -n "${val}" ]] && is_dirty_build_value "${val}" && resetprop_n "${key}" "${clean_fp}"

		key="ro.${p}build.version.incremental"
		val=$(resetprop "${key}")
		[[ -n "${val}" ]] && is_dirty_build_value "/${val}" && resetprop_n "${key}" "${clean_incr}"

		key="ro.${p}build.type"
		[[ -n "$(resetprop "${key}")" ]] && [[ "$(resetprop "${key}")" != "user" ]] && resetprop_n "${key}" "user"

		key="ro.${p}build.tags"
		[[ -n "$(resetprop "${key}")" ]] && [[ "$(resetprop "${key}")" != "release-keys" ]] && resetprop_n "${key}" "release-keys"
	done

	for p in "" system. system_ext. product. vendor. odm.; do
		key="ro.product.${p}name"
		val=$(resetprop "${key}")
		[[ -n "${val}" ]] && is_dirty_build_value "${val}" && resetprop_n "${key}" "$(strip_rom_prefix "${val}")"
	done

	val=$(resetprop ro.build.description)
	[[ -n "${val}" ]] && is_dirty_build_value "${val}" && \
		resetprop_n ro.build.description "${clean_product}-user ${release} ${id} ${clean_incr} release-keys"
	val=$(resetprop ro.build.flavor)
	[[ -n "${val}" ]] && is_dirty_build_value "${val}" && resetprop_n ro.build.flavor "${clean_product}-user"
	val=$(resetprop ro.build.display.id)
	[[ -n "${val}" ]] && is_dirty_build_value "${val}" && resetprop_n ro.build.display.id "${id}"
	val=$(resetprop ro.build.product)
	[[ -n "${val}" ]] && is_dirty_build_value "${val}" && resetprop_n ro.build.product "$(strip_rom_prefix "${val}")"
}

spoof_utc_properties() {
	new_utc_value=$(resetprop ro.build.date.utc)
	if_prop_exits_resetprop_n "ro.bootimage.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.odm.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.odm_dlkm.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.product.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.system.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.system_dlkm.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.system_ext.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.vendor.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "ro.vendor_dlkm.build.date.utc" "${new_utc_value}"
	if_prop_exits_resetprop_n "persist.vendor.build.date.utc" "${new_utc_value}"
}

spoof_date_properties() {
	new_date_value=$(resetprop ro.build.date)
	if_prop_exits_resetprop_n "ro.bootimage.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.odm.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.odm_dlkm.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.product.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.system.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.system_dlkm.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.system_ext.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.vendor.build.date" "${new_date_value}"
	if_prop_exits_resetprop_n "ro.vendor_dlkm.build.date" "${new_date_value}"
}

spoof_os_security_patch_level_property() {
	if [[ "${CURRENT_DAY}" -ge 5 ]]; then
		if_prop_exits_resetprop_n "ro.build.version.security_patch" "${CURRENT_YEAR}-${CURRENT_MONTH}-01"
	else
		if [[ "${CURRENT_MONTH}" -ge 2 ]]; then
			if_prop_exits_resetprop_n "ro.build.version.security_patch" "${CURRENT_YEAR}-$(printf "%02d" "$((CURRENT_MONTH - 1))")-01"
		else
			if_prop_exits_resetprop_n "ro.build.version.security_patch" "$((CURRENT_YEAR - 1))-12-01"
		fi
	fi
}

spoof_vendor_security_patch_level_property() {
	if [[ "${CURRENT_DAY}" -ge 5 ]]; then
		if_prop_exits_resetprop_n "ro.vendor.build.security_patch" "${CURRENT_YEAR}-${CURRENT_MONTH}-05"
	else
		if [[ "${CURRENT_MONTH}" -ge 2 ]]; then
			if_prop_exits_resetprop_n "ro.vendor.build.security_patch" "${CURRENT_YEAR}-$(printf "%02d" "$((CURRENT_MONTH - 1))")-05"
		else
			if_prop_exits_resetprop_n "ro.vendor.build.security_patch" "$((CURRENT_YEAR - 1))-12-05"
		fi
	fi
}

update_config_date() {
	sed -i "s/^CURRENT_YEAR=.*/CURRENT_YEAR='$(busybox date +%Y)'/" ${PERSISTENT_DIR}/config.sh
	sed -i "s/^CURRENT_MONTH=.*/CURRENT_MONTH='$(busybox date +%m)'/" ${PERSISTENT_DIR}/config.sh
	sed -i "s/^CURRENT_DAY=.*/CURRENT_DAY='$(busybox date +%d)'/" ${PERSISTENT_DIR}/config.sh
}

brene_sus_path() {
	if ${SUSFS_BIN} add_sus_path "$1" && [[ "${config_brene_logs}" == "1" ]]; then
		echo "[sus_path]: $1" >> "${PERSISTENT_DIR}/logs.txt"
	fi
}
brene_sus_path_loop() {
	if ${SUSFS_BIN} add_sus_path_loop "$1" && [[ "${config_brene_logs}" == "1" ]]; then
		echo "[sus_path_loop]: $1" >> "${PERSISTENT_DIR}/logs.txt"
	fi
}
brene_sus_map() {
	if ${SUSFS_BIN} add_sus_map "$1" && [[ "${config_brene_logs}" == "1" ]]; then
		echo "[sus_map]: $1" >> "${PERSISTENT_DIR}/logs.txt"
	fi
}
brene_set_uname() {
	if ${SUSFS_BIN} set_uname "$1" "$2" && [[ "${config_brene_logs}" == "1" ]]; then
		echo "[set_uname]: $1 $2" >> "${PERSISTENT_DIR}/logs.txt"
	fi
}
# Show apps a realistic copy of a system text file with only the ROM-name lines removed,
# instead of an empty file. An empty sepolicy/file_contexts is itself a giveaway (the real
# one is thousands of lines), so we keep the whole file and drop just the lines that name
# the ROM. The redirect is scope '3' (apps only); the system keeps reading the real file.
# $1 = real path, $2 = regex of ROM names to strip (grep -iE). Redirects only if something
# was actually removed and the result is non-empty.
brene_clean_redirect() {
	local path=$1 names=$2 file_name fake
	[[ -r "${path}" ]] || return
	grep -iqE "${names}" "${path}" || return

	file_name=$(basename "${path}")
	fake="${PERSISTENT_DIR}/fake_files/${file_name}"
	[[ -d "${PERSISTENT_DIR}/fake_files" ]] || mkdir -p "${PERSISTENT_DIR}/fake_files"

	grep -ivE "${names}" "${path}" > "${fake}" 2>/dev/null
	# Never hand apps an empty file; if stripping emptied it, leave the original visible.
	[[ -s "${fake}" ]] || { rm -f "${fake}"; return; }

	brene_open_redirect "${path}" "${fake}" '3'
}

# On most devices /system_ext, /product and /vendor are symlinks to /system/system_ext,
# /system/product and /system/vendor. A detector may open a file through EITHER path, and
# SuSFS open_redirect matches the literal path, so a redirect on one path misses the other.
# Echo the given path plus every symlink-alias of it.
path_aliases() {
	local p=$1
	echo "${p}"
	case "${p}" in
		/system/system_ext/*) echo "/system_ext/${p#/system/system_ext/}" ;;
		/system/product/*)    echo "/product/${p#/system/product/}" ;;
		/system/vendor/*)     echo "/vendor/${p#/system/vendor/}" ;;
		/system_ext/*)        echo "/system/system_ext/${p#/system_ext/}" ;;
		/product/*)           echo "/system/product/${p#/product/}" ;;
		/vendor/*)            echo "/system/vendor/${p#/vendor/}" ;;
	esac
}

# Redirect a path (and each of its symlink-aliases) to a replacement file, for apps.
brene_open_redirect() {
	local target=$1 redirect=$2 scope=$3 alias
	for alias in $(path_aliases "${target}"); do
		[[ -e "${alias}" ]] || continue
		brene_clone_perm "${redirect}" "${alias}"
		if ${SUSFS_BIN} add_open_redirect "${alias}" "${redirect}" "${scope}" && [[ "${config_brene_logs}" == "1" ]]; then
			echo "[open_redirect]: ${alias} ${redirect} ${scope}" >> "${PERSISTENT_DIR}/logs.txt"
		fi
	done
}
brene_kernel_umount() {
	${KSU_BIN} kernel notify-module-mounted
	${KSU_BIN} kernel umount add -f 2 "$1" 2> /dev/null
}
# Spoof a path's stat (timestamps) so an edited system file looks untouched to apps.
# Only ino/dev/size are left at their real values ('default'); the three times are set
# to a fixed old date. Effective only for umounted processes with uid >= 10000.
brene_sus_kstat() {
	[[ -e "$1" ]] || return
	if ${SUSFS_BIN} add_sus_kstat_statically "$1" 'default' 'default' 'default' 'default' '1230768000' '0' '1230768000' '0' '1230768000' '0' 'default' 'default' && [[ "${config_brene_logs}" == "1" ]]; then
		echo "[sus_kstat]: $1" >> "${PERSISTENT_DIR}/logs.txt"
	fi
}
