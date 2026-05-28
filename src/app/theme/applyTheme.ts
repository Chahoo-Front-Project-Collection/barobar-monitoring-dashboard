import { colors } from "@toss/tds-colors";

const SEMANTIC_THEME_VARIABLES = {
  "--color-page": colors.grey50,
  "--color-surface": colors.background,
  "--color-surface-muted": colors.grey100,
  "--color-surface-strong": colors.grey900,
  "--color-border": colors.grey200,
  "--color-border-strong": colors.grey300,
  "--color-text": colors.grey900,
  "--color-text-muted": colors.grey700,
  "--color-text-subtle": colors.grey500,
  "--color-primary": colors.blue500,
  "--color-primary-hover": colors.blue600,
  "--color-primary-soft": colors.blue50,
  "--color-danger": colors.red700,
  "--color-danger-strong": colors.red900,
  "--color-danger-soft": colors.red50,
  "--color-danger-border": colors.red200,
  "--color-warning": colors.orange700,
  "--color-warning-soft": colors.orange50,
  "--color-warning-border": colors.orange200,
  "--color-scrollbar-thumb": colors.greyOpacity300,
} as const;

function toCssVariableName(key: string) {
  return `--color-${key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
}

export function applyTheme(target: HTMLElement = document.documentElement) {
  for (const [key, value] of Object.entries(colors)) {
    target.style.setProperty(toCssVariableName(key), value);
  }

  for (const [name, value] of Object.entries(SEMANTIC_THEME_VARIABLES)) {
    target.style.setProperty(name, value);
  }
}
