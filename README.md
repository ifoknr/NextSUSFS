# NextSUSFS

A SuSFS module for KernelSU, made to work alongside [NextWheel](https://github.com/ifoknr/NextWheel) and [NextZygisk](https://github.com/ifoknr/NexTZygisk). It turns SuSFS kernel-level hiding into simple toggles, hides the traces of the NextWheel/NextZygisk stack automatically, and reports its status inside those tools.

> SuSFS works at the **kernel** level. It only does anything on a kernel built with the SuSFS patches. On a plain kernel, NextSUSFS still installs and the WebUI tells you the kernel has no SuSFS.

## Requirements

- KernelSU (official) or a KernelSU fork (e.g. ReSukiSU)
- A kernel patched with SuSFS (v2 recommended)
- Android with any CPU (arm64, arm, x86, x64)

## Credits

NextSUSFS is an independent module that stands on the work of others, under AGPLv3:

- [**BRENE**](https://github.com/rrr333nnn333/BRENE) by rrr333nnn333 — the module engine (config and apply scripts) this is based on.
- [**susfs4ksu**](https://gitlab.com/simonpunk/susfs4ksu) by **simonpunk** — SuSFS itself and the `ksu_susfs` userspace tool (built from source, GPLv3).
- [**KOWX712**](https://github.com/KOWX712) — contributions carried over from BRENE.

## License

NextSUSFS is licensed under the GNU Affero General Public License v3.0, the same license as BRENE. See [LICENSE](LICENSE).
