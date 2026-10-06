import { exec, toast } from './kernelsu.js'

const DATA = '/data/adb/nextsusfs'
const CONFIG = `${DATA}/config.sh`

/* ---------- i18n (English + Arabic; English is the fallback) ---------- */
const STR = {
  en: {
    'nav.home': 'Home', 'nav.tools': 'Tools', 'nav.settings': 'Settings',
    'home.features': 'Kernel hiding features', 'home.device': 'Device',
    'tools.stack': 'NextWheel stack', 'tools.integrity': 'Play Integrity', 'tools.conflict': 'Conflicting modules',
    'tools.nextwheel': 'Hides the Zygisk and root environment inside apps',
    'tools.nextzygisk': 'Standalone Zygisk that loads NextWheel',
    'tools.hma': 'Hides installed app names from other apps',
    'tools.pif': 'Passes basic and device integrity',
    'tools.trickystore': 'Spoofs a valid keybox for strong (hardware) integrity',
    'tools.trickyaddon': "Manages TrickyStore's target app list",
    'tools.conflictsub': 'Another SuSFS driver — only one may run',
    'tools.checking': '…', 'tools.installed': 'Installed', 'tools.notinstalled': 'Not installed', 'tools.disabled': 'Disabled',
    'settings.hiding': 'Hiding & spoofing', 'settings.about': 'About', 'settings.version': 'Version', 'settings.credits': 'Based on', 'settings.license': 'License',
    'mode.working': 'Working', 'mode.nokernel': 'No SuSFS in kernel', 'mode.old': 'Old SuSFS version', 'mode.reboot': 'Reboot needed', 'mode.unknown': 'Unable to determine',
    'desc.nokernel': 'This kernel has no SuSFS patches, so NextSUSFS cannot hide anything. Flash a SuSFS-patched kernel.',
    'desc.old': 'Your kernel has an old SuSFS (v1). v2 is recommended for effective hiding.',
    'desc.reboot': 'NextSUSFS is installed. Reboot to start hiding.',
    'desc.working': '%s of 9 kernel features enabled',
    'dev.android': 'Android', 'dev.model': 'Model', 'dev.kernel': 'Kernel', 'dev.susfs': 'SuSFS', 'dev.arch': 'Architecture',
    'applied': 'Saved. Reboot to apply.',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.tools': 'الأدوات', 'nav.settings': 'الإعدادات',
    'home.features': 'ميزات الإخفاء في النواة', 'home.device': 'الجهاز',
    'tools.stack': 'منظومة NextWheel', 'tools.integrity': 'نزاهة Play', 'tools.conflict': 'وحدات متعارضة',
    'tools.nextwheel': 'يخفي بيئة Zygisk والروت داخل التطبيقات',
    'tools.nextzygisk': 'Zygisk مستقل يحمّل NextWheel',
    'tools.hma': 'يخفي أسماء التطبيقات المثبّتة عن التطبيقات الأخرى',
    'tools.pif': 'يجتاز النزاهة الأساسية ونزاهة الجهاز',
    'tools.trickystore': 'يزيّف keybox صالح للنزاهة القوية (العتاد)',
    'tools.trickyaddon': 'يدير قائمة تطبيقات TrickyStore',
    'tools.conflictsub': 'مشغّل SuSFS آخر — واحد فقط يعمل',
    'tools.checking': '…', 'tools.installed': 'مثبّت', 'tools.notinstalled': 'غير مثبّت', 'tools.disabled': 'معطّل',
    'settings.hiding': 'الإخفاء والتزييف', 'settings.about': 'حول', 'settings.version': 'الإصدار', 'settings.credits': 'مبني على', 'settings.license': 'الرخصة',
    'mode.working': 'يعمل', 'mode.nokernel': 'لا يوجد SuSFS في النواة', 'mode.old': 'إصدار SuSFS قديم', 'mode.reboot': 'يحتاج إعادة تشغيل', 'mode.unknown': 'تعذّر تحديد الحالة',
    'desc.nokernel': 'نواتك ما فيها باتشات SuSFS، فما يقدر NextSUSFS يخفي شيئًا. ركّب نواة مرقّعة بـSuSFS.',
    'desc.old': 'نواتك فيها SuSFS قديم (v1). يُنصح بـv2 للإخفاء الفعّال.',
    'desc.reboot': 'تم تثبيت NextSUSFS. أعد التشغيل ليبدأ الإخفاء.',
    'desc.working': '%s من 9 ميزات نواة مفعّلة',
    'dev.android': 'أندرويد', 'dev.model': 'الطراز', 'dev.kernel': 'النواة', 'dev.susfs': 'SuSFS', 'dev.arch': 'المعمارية',
    'applied': 'تم الحفظ. أعد التشغيل للتطبيق.',
  },
}
let lang = 'en'
try { lang = (localStorage.getItem('/NextSUSFS/language') || (navigator.language || 'en').slice(0, 2)) } catch (e) {}
if (!STR[lang]) lang = 'en'
const t = (k) => (STR[lang][k] ?? STR.en[k] ?? k)
if (lang === 'ar') document.documentElement.setAttribute('dir', 'rtl')

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')) })
}

/* ---------- icons ---------- */
const ICONS = {
  ok: '<svg viewBox="0 0 24 24" stroke="#34d399"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>',
  warn: '<svg viewBox="0 0 24 24" stroke="#f3a93a"><path d="M12 3l9 16H3zM12 10v4M12 17v.5"/></svg>',
  err: '<svg viewBox="0 0 24 24" stroke="#f05252"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
}
const RING = { ok: '#34d399', warn: '#f3a93a', err: '#f05252' }

async function loadNavIcons() {
  for (const [id, page] of [['ic_home', 'home'], ['ic_tools', 'tools'], ['ic_settings', 'settings']]) {
    document.getElementById(id).style.backgroundImage = `url(./assets/${page}/outlined.svg)`
  }
}
function setNavActive(tab) {
  document.querySelectorAll('.nav_btn').forEach((b) => {
    const on = b.getAttribute('data-tab') === tab
    b.classList.toggle('active', on)
    b.querySelector('.nav_ic').style.backgroundImage = `url(./assets/${b.getAttribute('data-tab')}/${on ? 'filled' : 'outlined'}.svg)`
  })
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.getAttribute('data-panel') === tab))
}

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
async function out(cmd) { const r = await exec(cmd); return r.errno === 0 ? r.stdout.trim() : '' }
async function exists(path) { return (await exec(`test -e "${path}"`)).errno === 0 }

/* ---------- home ---------- */
const FEATURES = [
  ['sus_path', 'Hide paths'], ['sus_mount', 'Hide mounts'], ['sus_kstat', 'Spoof file stats'],
  ['spoof_uname', 'Spoof uname'], ['open_redirect', 'Open redirect'], ['try_umount', 'Unmount traces'],
  ['hide_symbols', 'Hide KSU symbols'], ['spoof_cmdline', 'Spoof cmdline'], ['enable_log', 'Kernel log'],
]

async function renderHome() {
  const kernelState = await out(`cat ${DATA}/kernel_state`) || 'unknown'
  const version = await out('susfs show version')
  const featuresRaw = await out('susfs show enabled_features')
  const enabled = new Set(featuresRaw.split('\n').map((s) => s.trim()).filter(Boolean))

  let cls, title, desc = '', ring = 'warn'
  if (kernelState === 'no_kernel' || (!version && kernelState !== 'ok')) {
    cls = ring = 'err'; title = t('mode.nokernel'); desc = t('desc.nokernel')
  } else if (kernelState === 'old' || version.startsWith('v1')) {
    cls = ring = 'warn'; title = t('mode.old'); desc = t('desc.old')
  } else if (version.startsWith('v2')) {
    cls = ring = 'ok'; title = t('mode.working'); desc = t('desc.working').replace('%s', String(enabled.size))
  } else {
    cls = ring = 'warn'; title = t('mode.unknown'); desc = t('desc.reboot')
  }

  const hero = document.getElementById('hero')
  hero.className = 'hero ' + cls
  document.getElementById('hero_ic').innerHTML = ICONS[ring]
  document.getElementById('hero_ring').style.setProperty('--ring', RING[ring])
  document.getElementById('hero_title').textContent = title
  document.getElementById('hero_sub').textContent = desc
  document.getElementById('hero_chips').innerHTML =
    (version ? `<span class="chip v">${esc(version)}</span>` : '') +
    `<span class="chip">${enabled.size}/9</span>`

  // banner only for problems, never for a user choice
  const banner = document.getElementById('banner')
  if (cls === 'err' || cls === 'warn') {
    banner.className = 'alert show ' + cls
    document.getElementById('banner_ic').innerHTML = ICONS[cls]
    document.getElementById('banner_t').textContent = title
    document.getElementById('banner_d').textContent = desc
  } else { banner.className = 'alert' }

  document.getElementById('features').innerHTML = FEATURES.map(([key, label]) => {
    const on = enabled.has(key)
    return `<div class="row"><div class="row_body"><div class="row_title">${esc(label)}</div></div>` +
      `<div class="row_val ${on ? 'st_on' : 'st_off'}"><span class="dot ${on ? 'on' : 'neutral'}"></span>${on ? 'On' : 'Off'}</div></div>`
  }).join('')

  const man = await out('getprop ro.product.manufacturer')
  const model = await out('getprop ro.product.model')
  const rel = await out('getprop ro.build.version.release')
  const sdk = await out('getprop ro.build.version.sdk')
  const arch = await out('getprop ro.product.cpu.abi')
  const kver = await out('uname -r')
  const rows = [
    [t('dev.model'), [man, model].filter(Boolean).join(' ')],
    [t('dev.android'), rel ? `${rel}${sdk ? ` · SDK ${sdk}` : ''}` : ''],
    [t('dev.kernel'), kver], [t('dev.susfs'), version || '—'], [t('dev.arch'), arch],
  ].filter(([, v]) => v)
  document.getElementById('device').innerHTML = rows.map(([k, v]) =>
    `<div class="drow"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')
}

/* ---------- tools ---------- */
async function renderTools() {
  const rows = document.querySelectorAll('#tools-stack .row, #tools-integrity .row, #tools-conflict .row')
  for (const row of rows) {
    const id = row.getAttribute('data-module')
    const st = row.querySelector('.status')
    const installed = await exists(`/data/adb/modules/${id}`)
    const disabled = installed && await exists(`/data/adb/modules/${id}/disable`)
    const conflict = row.closest('#tools-conflict')
    let text, dot
    if (!installed) { text = t('tools.notinstalled'); dot = 'neutral' }
    else if (disabled) { text = t('tools.disabled'); dot = 'neutral' }
    else { text = t('tools.installed'); dot = conflict ? 'off' : 'on' }
    st.innerHTML = `<span class="dot ${dot}"></span>${esc(text)}`
  }
}

/* ---------- settings ---------- */
const TOGGLES = [
  ['config_spoof_uname', { en: 'Spoof kernel uname', ar: 'تزييف uname النواة' }],
  ['config_hide_sus_mnts_for_non_su_procs', { en: 'Hide suspicious mounts', ar: 'إخفاء التركيبات المشبوهة' }],
  ['config_spoof_system_properties', { en: 'Spoof system properties', ar: 'تزييف خصائص النظام' }],
  ['config_spoof_fingerprint_properties', { en: 'Spoof build fingerprint', ar: 'تزييف بصمة البناء' }],
  ['config_enable_avc_log_spoofing', { en: 'Spoof SELinux (avc) logs', ar: 'تزييف سجلّات SELinux' }],
  ['config_hide_custom_recovery', { en: 'Hide custom recovery', ar: 'إخفاء الريكفري المخصص' }],
  ['config_spoof_cmdline_or_bootconfig', { en: 'Spoof cmdline / bootconfig', ar: 'تزييف cmdline / bootconfig' }],
  ['config_hide_addon_d', { en: 'Hide addon.d scripts', ar: 'إخفاء سكربتات addon.d' }],
]
async function renderSettings() {
  const raw = await out(`cat ${CONFIG}`)
  const cfg = {}
  raw.split('\n').forEach((line) => { const i = line.indexOf('='); if (i > 0) cfg[line.slice(0, i).trim()] = line.slice(i + 1).trim() })
  document.getElementById('settings-toggles').innerHTML = TOGGLES.map(([key, label]) => {
    const on = cfg[key] === '1'
    return `<div class="row"><div class="row_body"><div class="row_title">${esc(label[lang] || label.en)}</div></div>` +
      `<label class="switch"><input type="checkbox" data-key="${key}" ${on ? 'checked' : ''}><span class="slider"></span></label></div>`
  }).join('')
  document.querySelectorAll('#settings-toggles input[data-key]').forEach((input) => {
    input.addEventListener('change', async () => {
      const key = input.getAttribute('data-key')
      const val = input.checked ? '1' : '0'
      await exec(`sed -i 's/^${key}=.*/${key}=${val}/' ${CONFIG}`)
      toast(t('applied'))
    })
  })
  document.getElementById('about-version').textContent =
    (await out(`cat /data/adb/modules/nextsusfs/module.prop`)).split('\n').find((l) => l.startsWith('version='))?.split('=')[1] || '—'
}

/* ---------- boot ---------- */
async function refresh() {
  await renderHome()
  await renderTools()
  await renderSettings()
  document.getElementById('updated').textContent = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-u-nu-latn' : [], { hour: '2-digit', minute: '2-digit' })
}

applyI18n()
loadNavIcons()
setNavActive('home')
document.querySelectorAll('.nav_btn').forEach((b) => b.addEventListener('click', () => setNavActive(b.getAttribute('data-tab'))))
document.getElementById('refresh').addEventListener('click', refresh)
refresh().finally(() => { document.getElementById('loading').style.display = 'none' })
