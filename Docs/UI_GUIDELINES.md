# Goa City Platform UI/UX Guidelines

These guidelines define the standardized design system for all frontend pages to ensure a consistent, premium user experience. All future pages and components MUST adhere to these exact classes derived from the `Dashboard` standard.

## 1. Page Layout
- **Page Container:** Pages should be rendered inside `<DashboardLayout>`.
- **Top Margin/Padding:** The main content wrapper should typically have a bottom margin (e.g., `mb-8`) or padding.
- **Header Section:** Use a flex container for the title and primary actions:
```jsx
<div className="flex justify-between items-start mb-8">
    <div>
        <h1 className="text-3xl font-extrabold text-[#2D2D46]">Page Title</h1>
        <p className="text-gray-500 mt-2">Brief description of the page.</p>
    </div>
    <div className="flex items-center gap-4">
        {/* Actions / Buttons go here */}
    </div>
</div>
```

## 2. Typography
- **Page Headings (h1):** `text-3xl font-extrabold text-[#2D2D46]`
- **Section Headings (h2):** `text-xl font-bold text-gray-900 mb-6`
- **Card Headings (h3):** `text-lg font-bold text-gray-900`
- **Subtitles/Descriptions:** `text-gray-500 mt-2 text-sm`

## 3. Buttons
Buttons should NOT be full-width unless they exist inside a narrow modal or card.
- **Primary Action Button:** 
  `px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2 w-auto`
- **Secondary Action Button (Dark):** 
  `px-6 py-2.5 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2 w-auto`
- **Cancel / Neutral Button:** 
  `px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm w-auto`

## 4. Cards and Containers
- **Standard Card Wrappers:** `bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow`
- **Small Badges (Status/Type):** `text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`
  - *Example (Active):* `bg-emerald-50 text-emerald-700`
  - *Example (Neutral):* `bg-sky-50 text-sky-700`

## 5. Forms and Inputs
- **Text Inputs / Selects:** `w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none`
- **Labels:** `block text-sm font-bold text-gray-700 mb-1`

## 6. Colors and Aesthetics
- **Primary Brand Color:** `sky-600` (`#0284c7`)
- **Primary Dark Color:** `#2D2D46` (Used for text and secondary dark buttons)
- **Backgrounds:** Stick to clean white surfaces over standard light gray/off-white app backgrounds. Avoid using high saturation colors as backgrounds; use `50` or `100` variants (e.g. `bg-sky-50`) instead with matching `text-XYZ-700` and `border-XYZ-100` for badges/alerts.

## Summary Checklist for Code Reviews:
1. Ensure the H1 uses `text-3xl font-extrabold text-[#2D2D46]`.
2. Ensure buttons use rounded-xl and are not full width (`w-auto`) unless completely necessary.
3. Ensure button colors correspond to `bg-sky-600` for primary actions.
4. Keep the spacing consistent (`mb-8` for headers).
