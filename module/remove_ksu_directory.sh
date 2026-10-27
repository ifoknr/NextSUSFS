# shellcheck disable=SC2154
# shellcheck disable=SC2148
# Remove the root manager's leftover storage folders. Managers (KernelSU, KernelSU-Next,
# APatch) create Android/{data,media,obb}/<package> on internal storage; an app with
# MANAGE_EXTERNAL_STORAGE that lists them learns the device is rooted. Called once at boot
# and kept clean by inotifyd watchers (see config_hide_ksu_directories in boot-completed.sh).
remove_directory() {
	[[ -z "$1" ]] && return 1
	rm -rf "/storage/emulated/0/Android/data/$1" \
	       "/storage/emulated/0/Android/media/$1" \
	       "/storage/emulated/0/Android/obb/$1"
}

remove_directory "me.weishu.kernelsu"
remove_directory "com.rifsxd.ksunext"
remove_directory "me.bmax.apatch"
