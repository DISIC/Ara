import {
  AssistiveTechnology,
  Browsers,
  OperatingSystem,
  Platform
} from "../../../enums";
import { AuditEnvironment } from "../../../types";

// FIXME: there's probably a super cool and simple way to rewrite the content of this file

/** Default desktop environment combinations. */
export const desktopCombinations = [
  {
    title: "Combinaison 1",
    environments: [
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.NVDA,
        assistiveTechnologyVersion: ""
      },
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.JAWS,
        assistiveTechnologyVersion: ""
      },
      {
        operatingSystem: OperatingSystem.MAC_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: ""
      }
    ]
  },
  {
    title: "Combinaison 2",
    environments: [
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.NVDA,
        assistiveTechnologyVersion: ""
      },
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.EDGE,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.JAWS,
        assistiveTechnologyVersion: ""
      },
      {
        operatingSystem: OperatingSystem.MAC_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: ""
      }
    ]
  },
  {
    title: "Combinaison 3",
    environments: [
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.EDGE,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.NVDA,
        assistiveTechnologyVersion: ""
      },
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.JAWS,
        assistiveTechnologyVersion: ""
      },
      {
        operatingSystem: OperatingSystem.MAC_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: ""
      }
    ]
  }
];

/** Default mobile environment combinations. */
export const mobileCombinations = [
  {
    title: "Combinaison 1",
    environments: [
      {
        operatingSystem: OperatingSystem.I_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: ""
      }
    ]
  },
  {
    title: "Combinaison 2",
    environments: [
      {
        operatingSystem: OperatingSystem.ANDROID,
        operatingSystemVersion: "",
        browser: Browsers.CHROME,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.TALKBACK,
        assistiveTechnologyVersion: ""
      }
    ]
  }
];

/**
 * @returns true if same environment (ignoring version fields)
 */
function compareEnvironments(
  a: Partial<AuditEnvironment>,
  b: Partial<AuditEnvironment>
): boolean {
  return (
    a.assistiveTechnology === b.assistiveTechnology &&
    a.browser === b.browser &&
    a.operatingSystem === b.operatingSystem
  );
}

/**
 * @returns List of selected desktop combinations
 */
export function getDesktopCombinations(
  environments: Omit<AuditEnvironment, "id">[]
): string[] {
  const candidateEnvs = environments.filter((env) => {
    return (
      env.platform === Platform.DESKTOP &&
      !env.assistiveTechnologyVersion &&
      !env.operatingSystemVersion &&
      !env.browserVersion
    );
  });

  return desktopCombinations
    .filter((comb) => {
      return comb.environments.every((env) =>
        candidateEnvs.find((candidate) => compareEnvironments(candidate, env))
      );
    })
    .map((comb) => comb.title);
}

/**
 * @returns List of selected mobile combinations
 */
export function getMobileCombinations(
  environments: Omit<AuditEnvironment, "id">[]
): string[] {
  const candidateEnvs = environments.filter((env) => {
    return (
      env.platform === Platform.MOBILE &&
      !env.assistiveTechnologyVersion &&
      !env.operatingSystemVersion &&
      !env.browserVersion
    );
  });

  return mobileCombinations
    .filter((comb) => {
      return comb.environments.every((env) =>
        candidateEnvs.find((candidate) => compareEnvironments(env, candidate))
      );
    })
    .map((comb) => comb.title);
}

/**
 * Filter environments to only get the ones which do not form a default combination.
 */
export function getCustomEnvironments(
  environments: Omit<AuditEnvironment, "id">[]
): Omit<AuditEnvironment, "id">[] {
  const d = getDesktopCombinations(environments)
    .map((title) => desktopCombinations.find((comb) => comb.title === title))
    .map((comb) => comb?.environments)
    .flat()
    .filter(Boolean);

  const m = getMobileCombinations(environments)
    .map((title) => mobileCombinations.find((comb) => comb.title === title))
    .map((comb) => comb?.environments)
    .flat()
    .filter(Boolean);

  return environments.filter((env) => {
    if (
      env.assistiveTechnologyVersion ||
      env.operatingSystemVersion ||
      env.browserVersion
    ) {
      return true;
    }

    return !(
      d.some((desktopEnv) => compareEnvironments(desktopEnv!, env)) ||
      m.some((mobileEnv) => compareEnvironments(mobileEnv!, env))
    );
  });
}
