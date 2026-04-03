import { textblockTypeInputRule } from "@tiptap/core";
import Heading, { Level } from "@tiptap/extension-heading";

// Define needed heading levels
export function getDisplayedHeadings() {
  return [4, 5, 6] as Array<Level>;
}

function getHeadingLevel(el: Element) {
  const tag = el.tagName; // e.g. "H1", "H2"
  if (/^H[1-6]$/.test(tag)) {
    return Number(tag[1]);
  }
  return null; // not a heading
}

export const CustomHeading = Heading.extend({
  // prevent all marks from being applied to headings
  marks: "",
  // Shift heading levels when typing markdown
  // Example: "## Foobar" would render a `h5`
  addInputRules() {
    return this.options.levels.map((level) => {
      return textblockTypeInputRule({
        find: new RegExp(
          `^(#{${Math.min(...this.options.levels) - 3},${level - 3}})\\s$`
        ),
        type: this.type,
        getAttributes: {
          level
        }
      });
    });
  },

  /**
   * Realign heading levels in pasted HTML
   *
   * Examples for displayedHeadings = [4, 5, 6]:
   * - h1, h2, h3     → h4, h5, h6
   * - h2, h3, h4     → h4, h5, h6
   * - h5, h6         → h4, h5
   * - h3, h4, h5, h6 → h4, h5, h6, p
   */
  transformPastedHTML(html) {
    const dom = new DOMParser().parseFromString(html, "text/html");
    const headings = dom.querySelectorAll("h1,h2,h3,h4,h5,h6");

    const minValidLevel = Math.min(...getDisplayedHeadings());
    const minLevel = Math.min(...Array.from(headings).map((el) => (getHeadingLevel(el) || 7)));
    const levelOffset = minValidLevel - minLevel;

    headings.forEach((h) => {
      const hLevel = getHeadingLevel(h)!;
      const newLevel = hLevel + levelOffset;
      let newE: HTMLElement;
      if (newLevel <= 6) {
        newE = document.createElement(`h${newLevel}`);
      } else {
        newE = document.createElement("p");
      }
      newE.innerHTML = h.innerHTML;
      h.parentElement!.replaceChild(newE, h);
    });
    return new XMLSerializer().serializeToString(dom);
  }
}).configure({
  levels: getDisplayedHeadings()
});
