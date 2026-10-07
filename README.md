<div align="center">

<img src="docs/banner.png" alt="NextSUSFS" width="100%">

[![Release](https://img.shields.io/github/v/release/ifoknr/NextSUSFS?color=34d399&label=release)](https://github.com/ifoknr/NextSUSFS/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/ifoknr/NextSUSFS/total?color=34d399)](https://github.com/ifoknr/NextSUSFS/releases)
[![License](https://img.shields.io/badge/license-AGPLv3-5b8cff)](LICENSE)

</div>

# NextSUSFS

Kernel-level root hiding with [SuSFS](https://gitlab.com/simonpunk/susfs4ksu) for KernelSU. NextSUSFS is the kernel layer of the NEXT stack: it hides paths, mounts, memory maps and properties from apps, and works alongside [NextWheel](https://github.com/ifoknr/NextWheel) (apps) and [NextZygisk](https://github.com/ifoknr/NexTZygisk) (Zygote).

> [!WARNING]
> **Personal project, use at your own risk.** NextSUSFS changes how the kernel shows files and system values to apps. Keep a way to boot without modules (safe mode) before you install it.

## What it does

- **Hides the NEXT stack automatically.** NextWheel, NextZygisk and NextSUSFS folders and Zygisk libraries are hidden at every boot, along with AlwaysStrong, Play Integrity Fix and HMA-OSS.
- **Every option in one WebUI.** Over 40 settings across 7 pages: paths and files, custom ROM traces, kernel identity, system properties, KernelSU, developer options and display.
- **Your own lists.** Add paths to hide, re-hide, remove from memory maps, or unmount for apps, without editing files by hand.
- **Clear status.** The WebUI shows whether SuSFS is working, which kernel features your kernel has, and the state of the NEXT stack. NextWheel and NextZygisk show NextSUSFS in their own dashboards.
- **Detection apps built in.** Open Native Detector, TrustAttestor or KKND Detector straight from the Tools page to check the result.
- **Logs, backup and reset.** Read what was hidden at boot, back up your settings, or go back to defaults.
- **Any device.** arm64, arm, x86 and x86_64, English and Arabic, phones and tablets.

## Requirements

- KernelSU or a KernelSU fork (KernelSU Next, ReSukiSU, SukiSU Ultra)
- A kernel patched with **SuSFS v2**. On a kernel without SuSFS the module still installs, and the WebUI tells you the kernel has no SuSFS.
- Uninstall other SuSFS modules first (susfs4ksu, SuSFS Manager, BRENE). NextSUSFS disables them on install, because only one may run.

## Install

1. Download `NextSUSFS.zip` from [Releases](https://github.com/ifoknr/NextSUSFS/releases/latest).
2. Install it from your root manager → Modules → Install from storage.
3. Reboot, then open the module's WebUI.

## The NEXT stack

| Layer | Module | Role |
| --- | --- | --- |
| Apps | [NextWheel](https://github.com/ifoknr/NextWheel) | Hides the Zygisk and root environment inside apps |
| Zygote | [NextZygisk](https://github.com/ifoknr/NexTZygisk) | Standalone Zygisk that loads NextWheel |
| Kernel | **NextSUSFS** | Hides traces at the kernel level with SuSFS |

## Credits

- Developed by [**IFOKNR**](https://github.com/ifoknr).
- [**susfs4ksu**](https://gitlab.com/simonpunk/susfs4ksu) by **simonpunk**: SuSFS itself and the `ksu_susfs` tool (built from source, GPLv3).
- [**BRENE**](https://github.com/rrr333nnn333/BRENE) by rrr333nnn333 and [**KOWX712**](https://github.com/KOWX712): parts of the boot scripts are based on their work.

## License

GNU Affero General Public License v3.0. See [LICENSE](LICENSE).
