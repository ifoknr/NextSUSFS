import { exec, toast } from './kernelsu.js'
import { icon } from './icons.js'
import { PAGES, LISTS } from './pages.js'

const DATA = '/data/adb/nextsusfs'
const CONFIG = `${DATA}/config.sh`
const MODULE = '/data/adb/modules/nextsusfs'
const BACKUP = '/sdcard/Download/NextSUSFS'

/* ---------- i18n (English + Arabic; English is the fallback) ---------- */
const STR = {
  en: {
    'nav.home': 'Home', 'nav.hiding': 'Hiding', 'nav.tools': 'Tools', 'nav.settings': 'Settings',
    'home.overview': 'Overview', 'home.device': 'Device',
    'hub.hiding': 'Hiding', 'hub.manage': 'Manage',
    'tools.stack': 'NEXT stack', 'tools.hiding': 'Root hiding', 'tools.integrity': 'Play Integrity', 'tools.detectors': 'Detection apps', 'tools.conflict': 'Conflicting modules',
    'tools.native': 'Native checks for root, Zygisk and hooks', 'tools.trust': 'Key attestation, system integrity and runtime checks',
    'tools.kknd': '139 checks: mounts, SELinux, props, Zygisk and LSPosed', 'tools.detectorsnote': 'After changing a setting, reboot and run these to see what is still visible.',
    'tools.open': 'Open',
    'tools.nextwheel': 'Hides the Zygisk and root environment inside apps',
    'tools.nextzygisk': 'Standalone Zygisk that loads NextWheel',
    'tools.hma': 'Hides installed app names from other apps',
    'tools.alwaysstrong': 'Strong Play Integrity in one module (includes Play Integrity Fork)',
    'tools.alwaysstrongnote': "Use AlwaysStrong alone, or Play Integrity Fork with TEESimulator and Tricky Addon. Don't mix the two.",
    'tools.pif': 'Fixes Play Integrity verdicts, Google Wallet and RCS',
    'tools.tee': 'Simulates hardware-backed keys and key attestation',
    'tools.ta': 'WebUI to manage the TrickyStore target list',
    'tools.keyatt': 'Generates and verifies Android key and ID attestation',
    'tools.vdgoogle': 'Shows RCS, Google Wallet and Play Integrity attestations, on the device',
    'tools.community': 'Community',
    'tools.group': 'Telegram group: updates and support for every NEXT tool',
    'tools.dev': 'Developer on GitHub',
    'tools.help': 'Need help, or have an idea or a fix? Write in the group or contact me on GitHub.',
    'tools.other': 'Another module uses this ID',
    'tools.conflictsub': 'Another SuSFS driver — only one may run',
    'tools.checking': '…', 'tools.installed': 'Installed', 'tools.notinstalled': 'Not installed', 'tools.disabled': 'Disabled',
    'settings.language': 'Language', 'settings.system': 'System', 'settings.general': 'General',
    'settings.logs': 'Detailed logs', 'settings.logsd': 'Record every hidden path and spoofed value. Read them in Hiding → Logs.',
    'settings.reboot': 'Reboot device', 'settings.rebootd': 'Most changes apply at the next boot.',
    'settings.about': 'About', 'settings.version': 'Version', 'settings.developer': 'Developer', 'settings.credits': 'Based on', 'settings.license': 'License', 'settings.risk': 'Personal project, use at your own risk.',
    'mode.working': 'Working', 'mode.nokernel': 'No SuSFS in kernel', 'mode.old': 'Old SuSFS version', 'mode.unknown': 'Unable to determine',
    'desc.nokernel': 'This kernel has no SuSFS patches, so NextSUSFS cannot hide anything. Flash a SuSFS-patched kernel.',
    'desc.old': 'Your kernel has an old SuSFS (v1). v2 is recommended for effective hiding.',
    'desc.reboot': 'NextSUSFS is installed. Reboot to start hiding.',
    'desc.working': '%s of 9 kernel features enabled',
    'dev.android': 'Android', 'dev.model': 'Model', 'dev.kernel': 'Kernel', 'dev.susfs': 'SuSFS', 'dev.arch': 'Architecture',
    'count.on': '%a of %b on', 'on': 'On', 'off': 'Off',
    'pending.title': 'Saved. Reboot to apply.', 'pending.reboot': 'Reboot',
    'dlg.cancel': 'Cancel', 'dlg.ok': 'OK',
    'page.features': 'Kernel features', 'page.featuresd': 'What your kernel\'s SuSFS can do',
    'page.featuresnote': 'These come from the kernel and cannot be switched here. A feature that is off was not built into your kernel.',
    'page.lists': 'Your lists', 'page.listsd': 'Add your own paths to hide',
    'page.listsnote': 'One path per line, starting with /. Lines starting with # are comments.',
    'page.logs': 'Logs', 'page.logsd': 'What happened at the last boot',
    'page.backup': 'Backup & reset', 'page.backupd': 'Save, restore or reset your settings',
    'f.sus_path': 'Hide paths', 'f.sus_mount': 'Hide mounts', 'f.sus_kstat': 'Spoof file stats', 'f.spoof_uname': 'Spoof uname',
    'f.open_redirect': 'Open redirect', 'f.try_umount': 'Unmount traces', 'f.hide_symbols': 'Hide KSU symbols',
    'f.spoof_cmdline': 'Spoof cmdline', 'f.enable_log': 'Kernel log',
    'text.save': 'Save', 'text.invalid': 'Invalid value',
    'list.save': 'Save', 'list.saved': 'List saved. Reboot to apply.', 'list.bad': 'Line %s must start with /',
    'list.count': '%s paths',
    'logs.actions': 'Hidden paths & spoofed values', 'logs.stages': 'Boot stages', 'logs.empty': 'Empty',
    'logs.off': 'Detailed logs are off, so only boot stages are recorded. Turn them on in Settings.',
    'logs.copy': 'Copy', 'logs.clear': 'Clear', 'logs.copied': 'Copied', 'logs.cleared': 'Cleared',
    'backup.export': 'Back up settings', 'backup.exportd': 'Copies your settings and lists to Download/NextSUSFS.',
    'backup.import': 'Restore backup', 'backup.importd': 'Loads settings and lists from Download/NextSUSFS.',
    'backup.reset': 'Reset to defaults', 'backup.resetd': 'Puts every switch back to its default. Your lists are kept.',
    'backup.warn': 'The backup folder is hidden from apps from the next boot (Paths & files → Hide the backup folder). Delete it when you no longer need it.',
    'backup.none': 'No backup found', 'backup.last': 'Last backup: %s',
    'backup.done': 'Backed up', 'backup.restored': 'Restored. Reboot to apply.', 'backup.resetdone': 'Defaults restored. Reboot to apply.',
    'backup.confirmreset': 'Reset all switches?', 'backup.confirmresetd': 'Every hiding switch goes back to its default.',
    'backup.confirmimport': 'Restore backup?', 'backup.confirmimportd': 'Your current settings and lists will be replaced.',
    'reboot.confirm': 'Reboot now?', 'reboot.confirmd': 'The device restarts and your changes take effect.',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.hiding': 'الإخفاء', 'nav.tools': 'الأدوات', 'nav.settings': 'الإعدادات',
    'home.overview': 'نظرة عامة', 'home.device': 'الجهاز',
    'hub.hiding': 'الإخفاء', 'hub.manage': 'الإدارة',
    'tools.stack': 'منظومة NEXT', 'tools.hiding': 'إخفاء الروت', 'tools.integrity': 'نزاهة Play', 'tools.detectors': 'تطبيقات الفحص', 'tools.conflict': 'وحدات متعارضة',
    'tools.native': 'فحوصات أصلية (Native) للروت و Zygisk والهوكات', 'tools.trust': 'إثبات المفاتيح وسلامة النظام وبيئة التشغيل',
    'tools.kknd': '139 فحص: التركيبات و SELinux والخصائص و Zygisk و LSPosed', 'tools.detectorsnote': 'بعد ما تغيّر إعداد، أعد التشغيل وشغّل هذي التطبيقات تشوف وش باقي ظاهر.',
    'tools.open': 'فتح',
    'tools.nextwheel': 'يخفي بيئة Zygisk والروت داخل التطبيقات',
    'tools.nextzygisk': 'Zygisk مستقل يحمّل NextWheel',
    'tools.hma': 'يخفي أسماء التطبيقات المثبّتة عن التطبيقات الأخرى',
    'tools.alwaysstrong': 'نزاهة Play القوية في وحدة واحدة، وتشمل Play Integrity Fork',
    'tools.alwaysstrongnote': 'استخدم AlwaysStrong لحاله، أو Play Integrity Fork مع TEESimulator و Tricky Addon. لا تجمع بين الطريقتين.',
    'tools.pif': 'يصلح نتائج Play Integrity و Google Wallet و RCS',
    'tools.tee': 'يحاكي مفاتيح العتاد وإثبات المفاتيح',
    'tools.ta': 'واجهة لإدارة قائمة التطبيقات في TrickyStore',
    'tools.keyatt': 'ينشئ ويتحقق من إثبات المفاتيح والهوية في أندرويد',
    'tools.vdgoogle': 'يعرض حالة RCS و Google Wallet وطلبات Play Integrity من الجهاز نفسه',
    'tools.community': 'المجتمع',
    'tools.group': 'قروب تليقرام: تحديثات ودعم لكل أدوات NEXT',
    'tools.dev': 'المطوّر على GitHub',
    'tools.help': 'تحتاج مساعدة، أو عندك فكرة أو تعديل؟ اكتب في القروب أو تواصل معي على GitHub.',
    'tools.other': 'وحدة أخرى تستخدم نفس المعرّف',
    'tools.conflictsub': 'مشغّل SuSFS آخر — واحد فقط يعمل',
    'tools.checking': '…', 'tools.installed': 'مثبّت', 'tools.notinstalled': 'غير مثبّت', 'tools.disabled': 'معطّل',
    'settings.language': 'اللغة', 'settings.system': 'لغة الجهاز', 'settings.general': 'عام',
    'settings.logs': 'سجلات مفصّلة', 'settings.logsd': 'يسجّل كل مسار مخفي وكل قيمة مزيّفة. تقرأها من الإخفاء ← السجلات.',
    'settings.reboot': 'إعادة تشغيل الجهاز', 'settings.rebootd': 'أغلب التعديلات تتطبّق مع الإقلاع الجاي.',
    'settings.about': 'حول', 'settings.version': 'الإصدار', 'settings.developer': 'المطوّر', 'settings.credits': 'مبني على', 'settings.license': 'الرخصة', 'settings.risk': 'مشروع شخصي، استخدمه على مسؤوليتك.',
    'mode.working': 'يعمل', 'mode.nokernel': 'لا يوجد SuSFS في النواة', 'mode.old': 'إصدار SuSFS قديم', 'mode.unknown': 'تعذّر تحديد الحالة',
    'desc.nokernel': 'نواتك ما فيها باتشات SuSFS، فما يقدر NextSUSFS يخفي شيئًا. ركّب نواة مرقّعة بـSuSFS.',
    'desc.old': 'نواتك فيها SuSFS قديم (v1). يُنصح بـv2 للإخفاء الفعّال.',
    'desc.reboot': 'تم تثبيت NextSUSFS. أعد التشغيل ليبدأ الإخفاء.',
    'desc.working': '%s من 9 ميزات نواة مفعّلة',
    'dev.android': 'أندرويد', 'dev.model': 'الطراز', 'dev.kernel': 'النواة', 'dev.susfs': 'SuSFS', 'dev.arch': 'المعمارية',
    'count.on': '%a من %b مفعّل', 'on': 'مفعّل', 'off': 'مطفي',
    'pending.title': 'تم الحفظ. أعد التشغيل للتطبيق.', 'pending.reboot': 'إعادة تشغيل',
    'dlg.cancel': 'إلغاء', 'dlg.ok': 'موافق',
    'page.features': 'ميزات النواة', 'page.featuresd': 'وش يقدر يسوي SuSFS في نواتك',
    'page.featuresnote': 'هذي تجي من النواة وما تنغيّر من هنا. الميزة المطفية معناها إنها ما انبنت في نواتك.',
    'page.lists': 'قوائمك', 'page.listsd': 'أضف مساراتك الخاصة للإخفاء',
    'page.listsnote': 'مسار واحد في كل سطر، ويبدأ بـ/. السطر اللي يبدأ بـ# ملاحظة.',
    'page.logs': 'السجلات', 'page.logsd': 'وش صار في آخر إقلاع',
    'page.backup': 'النسخ والاستعادة', 'page.backupd': 'احفظ إعداداتك أو استرجعها أو صفّرها',
    'f.sus_path': 'إخفاء المسارات', 'f.sus_mount': 'إخفاء التركيبات', 'f.sus_kstat': 'تزييف بيانات الملفات', 'f.spoof_uname': 'تزييف uname',
    'f.open_redirect': 'تحويل فتح الملفات', 'f.try_umount': 'فك تركيب الآثار', 'f.hide_symbols': 'إخفاء رموز KSU',
    'f.spoof_cmdline': 'تزييف cmdline', 'f.enable_log': 'سجل النواة',
    'text.save': 'حفظ', 'text.invalid': 'قيمة غير صحيحة',
    'list.save': 'حفظ', 'list.saved': 'تم حفظ القائمة. أعد التشغيل للتطبيق.', 'list.bad': 'السطر %s لازم يبدأ بـ/',
    'list.count': '%s مسار',
    'logs.actions': 'المسارات المخفية والقيم المزيّفة', 'logs.stages': 'مراحل الإقلاع', 'logs.empty': 'فاضي',
    'logs.off': 'السجلات المفصّلة مطفية، فينسجل بس مراحل الإقلاع. فعّلها من الإعدادات.',
    'logs.copy': 'نسخ', 'logs.clear': 'مسح', 'logs.copied': 'تم النسخ', 'logs.cleared': 'تم المسح',
    'backup.export': 'نسخ الإعدادات', 'backup.exportd': 'ينسخ إعداداتك وقوائمك إلى Download/NextSUSFS.',
    'backup.import': 'استعادة النسخة', 'backup.importd': 'يرجّع الإعدادات والقوائم من Download/NextSUSFS.',
    'backup.reset': 'إرجاع الافتراضي', 'backup.resetd': 'يرجّع كل المفاتيح لوضعها الافتراضي. قوائمك تبقى.',
    'backup.warn': 'مجلد النسخة ينخفي عن التطبيقات من الإقلاع الجاي (المسارات والملفات ← إخفاء مجلد النسخة الاحتياطية). احذفه إذا ما عاد تحتاجه.',
    'backup.none': 'ما فيه نسخة', 'backup.last': 'آخر نسخة: %s',
    'backup.done': 'تم النسخ', 'backup.restored': 'تمت الاستعادة. أعد التشغيل للتطبيق.', 'backup.resetdone': 'رجع الافتراضي. أعد التشغيل للتطبيق.',
    'backup.confirmreset': 'ترجّع كل المفاتيح؟', 'backup.confirmresetd': 'كل مفاتيح الإخفاء ترجع لوضعها الافتراضي.',
    'backup.confirmimport': 'تسترجع النسخة؟', 'backup.confirmimportd': 'إعداداتك وقوائمك الحالية بتنستبدل.',
    'reboot.confirm': 'تعيد التشغيل الحين؟', 'reboot.confirmd': 'الجهاز يعيد التشغيل وتتطبّق تعديلاتك.',
  },
}
const LANG_KEY = '/NextSUSFS/language'
let langPref = 'system'
try { langPref = localStorage.getItem(LANG_KEY) || 'system' } catch (e) {}
let lang = langPref === 'system' ? (navigator.language || 'en').slice(0, 2) : langPref
if (!STR[lang]) lang = 'en'
const t = (k) => (STR[lang][k] ?? STR.en[k] ?? k)
const L = (o) => (o[lang] ?? o.en)
if (lang === 'ar') { document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.lang = 'ar' }

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')) })
}

/* ---------- helpers ---------- */
const STATUS = {
  ok: '<svg viewBox="0 0 24 24" stroke="#34d399"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>',
  warn: '<svg viewBox="0 0 24 24" stroke="#f3a93a"><path d="M12 3l9 16H3zM12 10v4M12 17v.5"/></svg>',
  err: '<svg viewBox="0 0 24 24" stroke="#f05252"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
}
const RING = { ok: '#34d399', warn: '#f3a93a', err: '#f05252' }
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const $ = (id) => document.getElementById(id)
async function out(cmd) { const r = await exec(cmd); return r.errno === 0 ? r.stdout.trim() : '' }
async function exists(path) { return (await exec(`test -e "${path}"`)).errno === 0 }
// UTF-8 safe base64, so file contents never pass through shell quoting
const b64 = (s) => btoa(unescape(encodeURIComponent(s)))

/* ---------- config ---------- */
let cfg = {}
async function loadConfig() {
  cfg = {}
  const raw = await out(`cat ${CONFIG}`)
  raw.split('\n').forEach((line) => {
    const i = line.indexOf('=')
    if (i > 0 && !line.startsWith('#')) cfg[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^'(.*)'$/, '$1')
  })
}
// value is either 0/1 or a string already checked against the item's pattern (no quotes, |, $, `)
async function setConfig(key, value, quoted) {
  const v = quoted ? `'${value}'` : value
  const r = await exec(`f=${CONFIG}; if grep -q '^${key}=' "$f"; then sed -i "s|^${key}=.*|${key}=${v}|" "$f"; else echo "${key}=${v}" >> "$f"; fi`)
  if (r.errno === 0) { cfg[key] = String(value); markPending() }
  return r.errno === 0
}
const isOn = (key) => cfg[key] === '1'
const toggles = (page) => page.items.filter((i) => !i.type)

/* ---------- pending reboot ---------- */
function markPending() {
  try { sessionStorage.setItem('/NextSUSFS/pending', '1') } catch (e) {}
  $('pending').classList.add('show')
}
function restorePending() {
  try { if (sessionStorage.getItem('/NextSUSFS/pending') === '1') $('pending').classList.add('show') } catch (e) {}
}
async function confirmBox(title, desc) {
  $('dlg_t').textContent = title
  $('dlg_d').textContent = desc
  $('dlg').classList.add('show')
  return new Promise((resolve) => {
    const done = (v) => { $('dlg').classList.remove('show'); $('dlg_yes').onclick = $('dlg_no').onclick = null; resolve(v) }
    $('dlg_yes').onclick = () => done(true)
    $('dlg_no').onclick = () => done(false)
  })
}
async function reboot() {
  if (await confirmBox(t('reboot.confirm'), t('reboot.confirmd'))) exec('/system/bin/svc power reboot || /system/bin/reboot')
}

/* ---------- home ---------- */
const FEATURES = ['sus_path', 'sus_mount', 'sus_kstat', 'spoof_uname', 'open_redirect', 'try_umount', 'hide_symbols', 'spoof_cmdline', 'enable_log']
let kernel = { version: '', enabled: new Set(), state: 'unknown' }

async function loadKernel() {
  kernel.state = await out(`cat ${DATA}/kernel_state`) || 'unknown'
  kernel.version = await out('susfs show version')
  const raw = await out('susfs show enabled_features')
  kernel.enabled = new Set(raw.split('\n').map((s) => s.trim()).filter(Boolean))
}

async function renderHome() {
  const { state, version, enabled } = kernel
  let cls, title, desc = ''
  if (state === 'no_kernel' || (!version && state !== 'ok')) { cls = 'err'; title = t('mode.nokernel'); desc = t('desc.nokernel') }
  else if (state === 'old' || version.startsWith('v1')) { cls = 'warn'; title = t('mode.old'); desc = t('desc.old') }
  else if (version.startsWith('v2')) { cls = 'ok'; title = t('mode.working'); desc = t('desc.working').replace('%s', String(enabled.size)) }
  else { cls = 'warn'; title = t('mode.unknown'); desc = t('desc.reboot') }

  $('hero').className = 'hero ' + cls
  $('hero_ic').innerHTML = STATUS[cls]
  $('hero_ring').style.setProperty('--ring', RING[cls])
  $('hero_title').textContent = title
  $('hero_sub').textContent = desc
  $('hero_chips').innerHTML = (version ? `<span class="chip v">${esc(version)}</span>` : '') + `<span class="chip">${enabled.size}/9</span>`

  // banner only for problems, never for a user choice
  const banner = $('banner')
  if (cls !== 'ok') {
    banner.className = 'alert show ' + cls
    $('banner_ic').innerHTML = STATUS[cls]
    $('banner_t').textContent = title
    $('banner_d').textContent = desc
  } else banner.className = 'alert'

  // one tile per hiding page with how many of its switches are on
  $('overview').innerHTML = PAGES.filter((p) => p.id !== 'display').map((p) => {
    const tg = toggles(p); const on = tg.filter((i) => isOn(i.key)).length
    return tile(`#hiding/${p.id}`, p.icon, L(p.t), t('count.on').replace('%a', on).replace('%b', tg.length))
  }).join('')

  const [man, model, rel, sdk, arch, kver] = await Promise.all([
    out('getprop ro.product.manufacturer'), out('getprop ro.product.model'), out('getprop ro.build.version.release'),
    out('getprop ro.build.version.sdk'), out('getprop ro.product.cpu.abi'), out('uname -r')])
  const rows = [
    [t('dev.model'), [man, model].filter(Boolean).join(' ')],
    [t('dev.android'), rel ? `${rel}${sdk ? ` · SDK ${sdk}` : ''}` : ''],
    [t('dev.kernel'), kver], [t('dev.susfs'), version || '—'], [t('dev.arch'), arch],
  ].filter(([, v]) => v)
  $('device').innerHTML = rows.map(([k, v]) => `<div class="drow"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')
}

/* ---------- hiding hub ---------- */
function tile(href, ic, title, sub) {
  return `<a class="tile" href="${href}"><div class="tile_ic">${icon(ic)}</div>` +
    `<div class="tile_t">${esc(title)}</div><div class="tile_d">${esc(sub)}</div></a>`
}
function renderHub() {
  $('hub_hiding').innerHTML =
    tile('#hiding/features', 'features', t('page.features'), `${kernel.enabled.size}/9 · ${t('page.featuresd')}`) +
    PAGES.map((p) => {
      const tg = toggles(p); const on = tg.filter((i) => isOn(i.key)).length
      return tile(`#hiding/${p.id}`, p.icon, L(p.t), `${on}/${tg.length} · ${L(p.d)}`)
    }).join('')
  $('hub_manage').innerHTML =
    tile('#hiding/lists', 'lists', t('page.lists'), t('page.listsd')) +
    tile('#hiding/logs', 'logs', t('page.logs'), t('page.logsd')) +
    tile('#hiding/backup', 'backup', t('page.backup'), t('page.backupd'))
}

/* ---------- single pages ---------- */
function switchRow(key, title, desc, warn) {
  return `<div class="row"><div class="row_body"><div class="row_title">${esc(title)}</div>` +
    (desc ? `<div class="row_sub">${esc(desc)}</div>` : '') +
    (warn ? `<div class="row_warn">${esc(warn)}</div>` : '') + '</div>' +
    `<label class="switch"><input type="checkbox" data-key="${key}" ${isOn(key) ? 'checked' : ''}><span class="slider"></span></label></div>`
}
function bindSwitches(root) {
  root.querySelectorAll('input[data-key]').forEach((input) => {
    input.addEventListener('change', async () => {
      const ok = await setConfig(input.getAttribute('data-key'), input.checked ? '1' : '0')
      if (!ok) input.checked = !input.checked
    })
  })
}

function renderConfigPage(page) {
  const body = $('page_body')
  let html = `<div class="page_head"><div class="page_ic">${icon(page.icon)}</div><div class="page_d">${esc(L(page.d))}</div></div>`
  if (page.note) html += `<div class="note top">${esc(L(page.note))}</div>`
  html += '<div class="card">' + page.items.map((item) => {
    const [title, desc, warn] = L(item)
    if (!item.type) return switchRow(item.key, title, desc, warn)
    const val = cfg[item.key] ?? item.dflt
    return `<div class="row col"><div class="row_body"><div class="row_title">${esc(title)}</div><div class="row_sub">${esc(desc)}</div></div>` +
      `<div class="field"><input class="input" dir="ltr" spellcheck="false" autocomplete="off" data-text="${item.key}" value="${esc(val)}" placeholder="${esc(item.dflt)}">` +
      `<div class="btn small" data-save="${item.key}">${t('text.save')}</div></div></div>`
  }).join('') + '</div>'
  body.innerHTML = html
  bindSwitches(body)
  body.querySelectorAll('[data-save]').forEach((btn) => btn.addEventListener('click', async () => {
    const key = btn.getAttribute('data-save')
    const item = page.items.find((i) => i.key === key)
    const input = body.querySelector(`[data-text="${key}"]`)
    const v = input.value.trim()
    if (!item.pattern.test(v)) { input.classList.add('bad'); toast(t('text.invalid')); return }
    input.classList.remove('bad')
    if (await setConfig(key, v, true)) toast(t('pending.title'))
  }))
}

function renderFeaturesPage() {
  $('page_body').innerHTML =
    `<div class="page_head"><div class="page_ic">${icon('features')}</div><div class="page_d">${esc(t('page.featuresd'))}</div></div>` +
    `<div class="note top">${esc(t('page.featuresnote'))}</div>` +
    '<div class="card">' + FEATURES.map((key) => {
      const on = kernel.enabled.has(key)
      return `<div class="row"><div class="row_body"><div class="row_title">${esc(t('f.' + key))}</div><div class="row_sub mono">${key}</div></div>` +
        `<div class="row_val ${on ? 'st_on' : 'st_off'}"><span class="dot ${on ? 'on' : 'neutral'}"></span>${on ? t('on') : t('off')}</div></div>`
    }).join('') + '</div>'
}

async function renderListsPage() {
  const body = $('page_body')
  const contents = await Promise.all(LISTS.map((l) => out(`cat ${DATA}/${l.file} 2>/dev/null`)))
  body.innerHTML =
    `<div class="page_head"><div class="page_ic">${icon('lists')}</div><div class="page_d">${esc(t('page.listsd'))}</div></div>` +
    `<div class="note top">${esc(t('page.listsnote'))}</div>` +
    LISTS.map((l, i) => {
      const [title, desc] = L(l)
      const n = contents[i].split('\n').filter((s) => s.trim() && !s.trim().startsWith('#')).length
      return `<div class="card pad"><div class="list_head"><div><div class="row_title">${esc(title)}</div><div class="row_sub">${esc(desc)}</div></div>` +
        `<span class="chip" data-count="${i}">${t('list.count').replace('%s', n)}</span></div>` +
        `<textarea class="area" dir="ltr" spellcheck="false" data-list="${i}" placeholder="/data/adb/example">${esc(contents[i])}</textarea>` +
        `<div class="btn_row"><span class="mono faint">${l.file}</span><div class="btn small" data-savelist="${i}">${t('list.save')}</div></div></div>`
    }).join('')
  body.querySelectorAll('[data-savelist]').forEach((btn) => btn.addEventListener('click', async () => {
    const i = Number(btn.getAttribute('data-savelist'))
    const area = body.querySelector(`[data-list="${i}"]`)
    const lines = area.value.replace(/\r/g, '').split('\n')
    const bad = lines.findIndex((s) => s.trim() && !s.trim().startsWith('#') && !s.trim().startsWith('/'))
    if (bad >= 0) { area.classList.add('bad'); toast(t('list.bad').replace('%s', bad + 1)); return }
    area.classList.remove('bad')
    const text = lines.map((s) => s.trim()).join('\n').replace(/\n+$/, '') + '\n'
    const r = await exec(`echo '${b64(text)}' | base64 -d > ${DATA}/${LISTS[i].file}`)
    if (r.errno === 0) {
      markPending(); toast(t('list.saved'))
      const n = lines.filter((s) => s.trim() && !s.trim().startsWith('#')).length
      body.querySelector(`[data-count="${i}"]`).textContent = t('list.count').replace('%s', n)
    }
  }))
}

async function renderLogsPage() {
  const body = $('page_body')
  const [actions, stages] = await Promise.all([out(`cat ${DATA}/logs.txt 2>/dev/null`), out(`cat ${DATA}/log.txt 2>/dev/null`)])
  const block = (id, title, text, file) =>
    `<div class="sec">${esc(title)}</div><div class="card pad"><pre class="log" id="${id}">${esc(text || t('logs.empty'))}</pre>` +
    `<div class="btn_row"><span class="mono faint">${file}</span><div class="btns">` +
    `<div class="btn small ghost" data-copy="${id}">${t('logs.copy')}</div><div class="btn small ghost" data-clear="${file}">${t('logs.clear')}</div></div></div></div>`
  body.innerHTML =
    `<div class="page_head"><div class="page_ic">${icon('logs')}</div><div class="page_d">${esc(t('page.logsd'))}</div></div>` +
    (isOn('config_brene_logs') ? '' : `<div class="note top">${esc(t('logs.off'))}</div>`) +
    block('log_actions', t('logs.actions'), actions, 'logs.txt') + block('log_stages', t('logs.stages'), stages, 'log.txt')
  body.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copyText($(b.getAttribute('data-copy')).textContent)))
  body.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', async () => {
    await exec(`true > ${DATA}/${b.getAttribute('data-clear')}`); toast(t('logs.cleared')); renderLogsPage()
  }))
}
function copyText(text) {
  const done = () => toast(t('logs.copied'))
  const fallback = () => {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select()
    try { document.execCommand('copy'); done() } catch (e) {}
    ta.remove()
  }
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fallback)
  else fallback()
}

async function renderBackupPage() {
  const body = $('page_body')
  const when = await out(`[ -f ${BACKUP}/config.sh ] && date -r ${BACKUP}/config.sh '+%Y-%m-%d %H:%M'`)
  const action = (id, ic, title, desc, cls = '') =>
    `<div class="row act ${cls}" data-act="${id}"><div class="row_ic">${icon(ic)}</div><div class="row_body"><div class="row_title">${esc(title)}</div><div class="row_sub">${esc(desc)}</div></div><div class="chev">${icon('next')}</div></div>`
  body.innerHTML =
    `<div class="page_head"><div class="page_ic">${icon('backup')}</div><div class="page_d">${esc(when ? t('backup.last').replace('%s', when) : t('backup.none'))}</div></div>` +
    '<div class="card">' +
    action('export', 'download', t('backup.export'), t('backup.exportd')) +
    action('import', 'upload', t('backup.import'), t('backup.importd'), when ? '' : 'disabled') +
    action('reset', 'reset', t('backup.reset'), t('backup.resetd'), 'danger') +
    '</div>' + `<div class="note">${esc(t('backup.warn'))}</div>`
  const files = `config.sh ${LISTS.map((l) => l.file).join(' ')}`
  body.querySelector('[data-act="export"]').addEventListener('click', async () => {
    const r = await exec(`mkdir -p ${BACKUP} && cd ${DATA} && cp ${files} ${BACKUP}/ 2>/dev/null; [ -f ${BACKUP}/config.sh ]`)
    toast(r.errno === 0 ? t('backup.done') : 'Error'); renderBackupPage()
  })
  body.querySelector('[data-act="import"]').addEventListener('click', async () => {
    if (!when || !(await confirmBox(t('backup.confirmimport'), t('backup.confirmimportd')))) return
    const r = await exec(`cd ${BACKUP} && for f in ${files}; do [ -f "$f" ] && cp "$f" ${DATA}/; done; true`)
    if (r.errno === 0) { await loadConfig(); markPending(); toast(t('backup.restored')) }
  })
  body.querySelector('[data-act="reset"]').addEventListener('click', async () => {
    if (!(await confirmBox(t('backup.confirmreset'), t('backup.confirmresetd')))) return
    const r = await exec(`cp ${MODULE}/config.sh ${CONFIG}`)
    if (r.errno === 0) { await loadConfig(); markPending(); toast(t('backup.resetdone')) }
  })
}

/* ---------- tools ---------- */
async function renderTools() {
  const apps = document.querySelectorAll('#tools-detectors .row[data-app]')
  await Promise.all([...apps].map(async (row) => {
    const pkg = row.getAttribute('data-app')
    const st = row.querySelector('.status')
    const installed = (await exec(`pm path ${pkg}`)).errno === 0
    st.innerHTML = installed
      ? `<div class="btn small ghost" data-open="${pkg}">${t('tools.open')}</div>`
      : `<span class="dot neutral"></span>${esc(t('tools.notinstalled'))}`
  }))
  const rows = document.querySelectorAll('#tools-stack .row, #tools-hiding .row, #tools-integrity .row, #tools-conflict .row')
  await Promise.all([...rows].map(async (row) => {
    const id = row.getAttribute('data-module')
    const st = row.querySelector('.status')
    const installed = await exists(`/data/adb/modules/${id}`)
    const disabled = installed && await exists(`/data/adb/modules/${id}/disable`)
    const conflict = row.closest('#tools-conflict')
    // some modules share an id (AlwaysStrong uses tricky_store), so check the name too
    const wantName = row.getAttribute('data-name')
    const name = installed && wantName
      ? ((await out(`cat /data/adb/modules/${id}/module.prop`)).split('\n').find((l) => l.startsWith('name='))?.slice(5).trim() || '')
      : ''
    let text, dot
    if (!installed) { text = t('tools.notinstalled'); dot = 'neutral' }
    else if (wantName && !name.toLowerCase().includes(wantName.toLowerCase())) { text = t('tools.other'); dot = 'off' }
    else if (disabled) { text = t('tools.disabled'); dot = 'neutral' }
    else { text = t('tools.installed'); dot = conflict ? 'off' : 'on' }
    st.innerHTML = `<span class="dot ${dot}"></span>${esc(text)}`
  }))
}

/* ---------- settings ---------- */
async function renderSettings() {
  document.querySelectorAll('#lang_seg .seg_btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-lang') === langPref)
    b.onclick = () => {
      try { localStorage.setItem(LANG_KEY, b.getAttribute('data-lang')) } catch (e) {}
      location.reload()
    }
  })
  const g = $('settings_general')
  g.innerHTML = switchRow('config_brene_logs', t('settings.logs'), t('settings.logsd')) +
    `<div class="row act" id="reboot_row"><div class="row_ic">${icon('power')}</div><div class="row_body"><div class="row_title">${esc(t('settings.reboot'))}</div>` +
    `<div class="row_sub">${esc(t('settings.rebootd'))}</div></div><div class="chev">${icon('next')}</div></div>`
  bindSwitches(g)
  $('reboot_row').addEventListener('click', reboot)
  $('about-version').textContent =
    (await out(`cat ${MODULE}/module.prop`)).split('\n').find((l) => l.startsWith('version='))?.split('=')[1] || '—'
}

/* ---------- open an installed detection app ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-open]')
  if (!b) return
  const pkg = b.getAttribute('data-open')
  if (!/^[a-z0-9_.]+$/i.test(pkg)) return
  exec(`am start -n "$(cmd package resolve-activity --brief ${pkg} | tail -n 1)"`)
})

/* ---------- links ---------- */
// The WebUI is a WebView: following a link would replace the app with the page. Hand
// developer links to the system browser instead.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="https://"]')
  if (!a) return
  e.preventDefault()
  const url = a.href.replace(/'/g, '')
  if (typeof ksu === 'undefined') { window.open(url, '_blank'); return }
  exec(`am start -a android.intent.action.VIEW -d '${url}'`)
})

/* ---------- router ---------- */
// #home, #hiding, #tools, #settings, or #hiding/<page>. Hash routing gives the WebView a
// history, so the system back gesture returns from a page to the hub.
const TABS = ['home', 'hiding', 'tools', 'settings']
const SPECIAL = {
  features: { title: () => t('page.features'), render: renderFeaturesPage },
  lists: { title: () => t('page.lists'), render: renderListsPage },
  logs: { title: () => t('page.logs'), render: renderLogsPage },
  backup: { title: () => t('page.backup'), render: renderBackupPage },
}

async function route() {
  const [tab0, sub] = location.hash.replace(/^#/, '').split('/')
  const tab = TABS.includes(tab0) ? tab0 : 'home'
  const special = sub && SPECIAL[sub]
  const page = sub && PAGES.find((p) => p.id === sub)
  const inPage = tab === 'hiding' && (special || page)

  document.querySelectorAll('.nav_btn').forEach((b) => {
    const on = b.getAttribute('data-tab') === tab
    b.classList.toggle('active', on)
    b.querySelector('.nav_ic').style.backgroundImage = `url(./assets/${b.getAttribute('data-tab')}/${on ? 'filled' : 'outlined'}.svg)`
  })
  const panel = inPage ? 'page' : tab
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.getAttribute('data-panel') === panel))
  $('back').classList.toggle('show', !!inPage)
  $('brand').textContent = inPage ? (special ? special.title() : L(page.t)) : 'NextSUSFS'
  window.scrollTo(0, 0)

  if (inPage) { if (special) await special.render(); else renderConfigPage(page) }
  else if (tab === 'home') await renderHome()
  else if (tab === 'hiding') renderHub()
  else if (tab === 'tools') await renderTools()
  else if (tab === 'settings') await renderSettings()
}

async function refresh() {
  await Promise.all([loadConfig(), loadKernel()])
  await route()
  $('updated').textContent = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-u-nu-latn' : [], { hour: '2-digit', minute: '2-digit' })
}

applyI18n()
restorePending()
$('back').innerHTML = icon('back')
document.querySelectorAll('.nav_btn').forEach((b) => b.addEventListener('click', () => { location.hash = b.getAttribute('data-tab') }))
$('back').addEventListener('click', () => { if (history.length > 1) history.back(); else location.hash = 'hiding' })
$('refresh').addEventListener('click', refresh)
$('pending_reboot').addEventListener('click', reboot)
window.addEventListener('hashchange', route)
refresh().finally(() => { $('loading').style.display = 'none' })
