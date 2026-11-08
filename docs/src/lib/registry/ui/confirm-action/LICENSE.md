# Source and License

Native Svelte state-machine adaptation of free Arc ConfirmMorph (`uiarc.dev/r/confirm-morph.json`), as used by TokenPlan revision c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4. Valar Button replaces source buttons; native timers replace Motion. Additional localized status labels avoid hardcoded English announcements.

The component-local `morph.ts` is independently authored Valar work (2026), not a translation of Arc animation code, CSS, springs or curves. It measures Svelte DOM updates and uses native Web Animations for size/radius/content feedback, with independently chosen timing and a direct reduced-motion path. The unchanged free original is executed only for browser timing/geometry observations. No Arc animation code/CSS/parameters, Pro source, React or Motion runtime is distributed. This is an intentional visual adaptation, not an equivalence claim. The adapted state machine retains the source MIT notice below; independent additions use the repository MIT license.

MIT License

Copyright (c) 2026 Elia Kuratli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
