import { Extensions } from "@tiptap/core";
import { AraTiptapRenderedExtension } from "./AraTiptapRenderedExtension";
import { ExtendedLinkExtension, LinkExtension } from "./extensions/LinkExtension";
import { MarkdownExtension } from "./extensions/MarkdownExtension";
import { getStarterKitExtensions } from "./extensions/StarterKitExtensions";
import { PasteMarkdownExtension } from "./markdown/PasteMarkdownExtension";

/**
 * have basic extensions (bold, italic,
 * ordered list, unordered list and Markdown)
 */
const commonBasicExtensions: Extensions = [
  getStarterKitExtensions({
    blockquote: false,
    code: false,
    codeBlock: false,
    dropcursor: false,
    heading: false,
    strike: false,
    underline: false
  }),
  MarkdownExtension
];

/**
 * have basic extensions for tiptap editor (bold, italic,
 * ordered list, unordered list,
 * Paste Markdown, Link)
 */
export function getTiptapBasicEditorExtensions() {
  return [
    ...commonBasicExtensions,
    PasteMarkdownExtension,
    LinkExtension
  ];
}

/**
 * have basic extensions for tiptap Rendered (bold, italic,
 * ordered list, unordered list,
 * Paste Markdown, extendedLink)
 */
export const tiptapRenderedBasicExtensions = [
  ...commonBasicExtensions,
  ExtendedLinkExtension,
  AraTiptapRenderedExtension
];
