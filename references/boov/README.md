# Boov component reference library

Source: https://github.com/boovwallet/BoovSite

This snapshot preserves the full component collection available on all 29 repository branches when the venture site was rebuilt. It contains **84 files from `main` and 155 additional unique historical file versions**. Component source and component CSS are included. Application data, payment/server code, credentials, generated assets, and `node_modules` are outside the scope of this reference library.

- `components/`: unchanged component sources from main at `15ec129f5322234821a24f04f07305856fac973a`.
- `variants/<blob-prefix>/components/`: other unique versions, stored once per path and Git blob.
- `manifest.json`: each source path, complete Git blob hash, branches containing that version, and local archive path.
- `branches.json`: branch names and exact commit hashes at snapshot time.

These files are preserved source references, not entry points in the Vite application. Reusable primitives adapted for React 19, Motion, and the venture palette live in `src/components/boov/primitives/`. See `docs/BOOV_COMPONENTS.md` for the use map.

The source package declares author `Boov` and license `MIT`. No separate LICENSE file was present in the source repository. Upstream component notices and comments are retained in these reference files. See the project's `THIRD_PARTY_NOTICES.md`.
