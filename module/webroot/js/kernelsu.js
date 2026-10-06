/* KernelSU WebUI bridge (https://github.com/tiann/KernelSU). exec() runs a shell command
   and resolves { errno, stdout, stderr }. On a computer (no ksu) it returns mock data so
   the UI can be developed and tested in a browser. */

const DEV = {
  'cat /data/adb/nextsusfs/kernel_state': { errno: 0, stdout: 'ok', stderr: '' },
  'susfs show version': { errno: 0, stdout: 'v2.3.0', stderr: '' },
  'susfs show enabled_features': { errno: 0, stdout: 'sus_path\nsus_mount\nsus_kstat\nspoof_uname\nenable_log\nhide_symbols\nspoof_cmdline\nopen_redirect\ntry_umount', stderr: '' },
  'cat /data/adb/modules/nextsusfs/module.prop': { errno: 0, stdout: 'id=nextsusfs\nversion=v0.0.1\nname=NextSUSFS\n', stderr: '' },
  'getprop ro.product.manufacturer': { errno: 0, stdout: 'samsung', stderr: '' },
  'getprop ro.product.model': { errno: 0, stdout: 'SM-X926B', stderr: '' },
  'getprop ro.build.version.release': { errno: 0, stdout: '14', stderr: '' },
  'getprop ro.build.version.sdk': { errno: 0, stdout: '34', stderr: '' },
  'getprop ro.product.cpu.abi': { errno: 0, stdout: 'arm64-v8a', stderr: '' },
  'uname -r': { errno: 0, stdout: '6.1.177-GKID-IFOKNR-Kernel', stderr: '' },
}

function dev(command) {
  if (DEV[command]) return Promise.resolve(DEV[command])
  if (command.startsWith('cat /data/adb/nextsusfs/config.sh')) {
    return Promise.resolve({ errno: 0, stdout: 'config_spoof_uname=1\nconfig_hide_sus_mnts_for_non_su_procs=1\nconfig_spoof_system_properties=1\nconfig_spoof_fingerprint_properties=1\nconfig_enable_avc_log_spoofing=1\nconfig_hide_custom_recovery=1\nconfig_spoof_cmdline_or_bootconfig=0\nconfig_hide_addon_d=0', stderr: '' })
  }
  if (command.startsWith('test -e /data/adb/modules/treat_wheel') || command.startsWith('test -e /data/adb/modules/rezygisk')) {
    return Promise.resolve({ errno: 0, stdout: '', stderr: '' })
  }
  if (command.startsWith('test -e')) return Promise.resolve({ errno: 1, stdout: '', stderr: '' })
  return Promise.resolve({ errno: 0, stdout: '', stderr: '' })
}

export function exec(command, options = {}) {
  if (typeof ksu === 'undefined') return dev(command)
  return new Promise((resolve) => {
    const cb = `exec_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`
    window[cb] = (errno, stdout, stderr) => { resolve({ errno, stdout, stderr }); delete window[cb] }
    try { ksu.exec(command, JSON.stringify(options), cb) }
    catch (e) { resolve({ errno: 1, stdout: '', stderr: String(e) }); delete window[cb] }
  })
}

export function toast(msg) { try { if (typeof ksu !== 'undefined') ksu.toast(msg) } catch (e) {} }
export function fullScreen(on) { try { if (typeof ksu !== 'undefined') ksu.fullScreen(on) } catch (e) {} }
