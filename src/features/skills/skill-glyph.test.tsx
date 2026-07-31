import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SkillGlyph } from "./skill-glyph";

test("renders a catalog icon with one shared asset convention", () => {
  const html = renderToStaticMarkup(
    <SkillGlyph
      icon="attack"
      category="armor"
      label="Attack Boost"
      className="size-4"
    />,
  );

  expect(html).toContain('/images/icons/attack.png');
  expect(html).toContain('alt="Attack Boost"');
});

test("renders a category fallback when catalog icon metadata is absent", () => {
  const html = renderToStaticMarkup(
    <SkillGlyph icon={null} category="group" label="Group Skill" />,
  );

  expect(html).toContain("<svg");
  expect(html).toContain('aria-label="Group Skill"');
});
