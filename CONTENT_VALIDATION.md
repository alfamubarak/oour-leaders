# AFCSC Our Leaders — required content verification

This is a demonstration with user-supplied images and deliberately marked sample records. The software should **not** be represented as the official AFCSC historical roll until the College verifies the following.

| Field | Current status | Before publication |
|---|---|---|
| Current Commandant | AVM O. A. Tuwase portrait/name from filename, **provisional mapping** | Confirm actual office holder and picture |
| Current Director of Air Warfare | AVM E. O. Alade portrait/name from filename, **provisional mapping** | Confirm actual office holder and picture |
| 6 sample Commandants | Historical Profile 01–06 uses numbered unnamed images | Supply name, rank, role, dates, correct portrait and chronological order |
| 8 sample Directors | Eight filename-labelled officers 28–35; order based on filenames | Confirm names, office association, tenure dates and actual order |
| All biographies | Awaiting approved text | Supply short, factual biographies |
| Quote or contributions | Awaiting approved text | Supply attributed quotes or verified contributions; omit otherwise |
| Complete archive | 13 anonymous numbered portraits and 35 named-by-file historical portraits | Confirm identity and publication permissions for each image |

## Updating records

Open `data.js` in a text editor. Each entry in `leaders` has `id`, `group`, `current`, `rank`, `name`, `appointment`, `tenure`, `photo`, `biography`, `quote`, and `contributions`. Keep `id` unique and `group` either `commandant` or `director`. Place any replacement photos in `assets/` and set `photo` to the exact relative filename. When no photo is available, set `photo:''` and the site uses `assets/portrait-placeholder.svg` automatically.

Do **not** infer official historical tenure from the supplied numerical filenames. Profiles and images have intentionally neutral, provisional captions.
