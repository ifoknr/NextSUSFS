# shellcheck disable=SC2154
# shellcheck disable=SC2148
# Remove root managers' and root-adjacent apps' leftover storage folders. KernelSU,
# KernelSU-Next, APatch, SukiSU, ReSukiSU, HMA-OSS and Termux create
# Android/{data,media,obb}/<package> on internal storage; an app with
# MANAGE_EXTERNAL_STORAGE that lists them learns the device is rooted. Called once at boot
# and kept clean by inotifyd watchers (see config_hide_ksu_directories in boot-completed.sh).
# INFO: Give the manager a moment to finish creating its folder; removing it while the
#         manager app is still starting up makes the KernelSU manager crash (BRENE 70a57e2).
sleep 1

remove_directory() {
	[[ -z "$1" ]] && return 1
	rm -rf "/storage/emulated/0/Android/data/$1" \
	       "/storage/emulated/0/Android/media/$1" \
	       "/storage/emulated/0/Android/obb/$1"
}

remove_directory "me.weishu.kernelsu"
remove_directory "com.rifsxd.ksunext"
remove_directory "me.bmax.apatch"
remove_directory "com.resukisu.resukisu"
remove_directory "com.sukisu.ultra"
remove_directory "org.frknkrc44.hma_oss"
remove_directory "com.termux"
