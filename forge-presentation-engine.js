function line(char = "━", length = 30) {
  return char.repeat(length);
}

function section(title) {
  return `\n${line()}\n${title}\n${line()}\n`;
}

function formatNumber(value) {
  if (value === null || value === undefined) return "N/A";

  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function bullet(items = []) {
  return items.map((item) => `• ${item}`).join("\n");
}

function check(items = []) {
  return items.map((item) => `✅ ${item}`).join("\n");
}

function warning(items = []) {
  return items.map((item) => `🟡 ${item}`).join("\n");
}

function renderClientAdvisorPresentation({
  title,
  intro,
  sections = [],
  conclusion
}) {
  let output = "";

  output += `\n${title}\n`;

  if (intro) {
    output += `\n${intro}\n`;
  }

  sections.forEach((item) => {
    output += section(item.title);
    output += `${item.body}\n`;
  });

  if (conclusion) {
    output += section("CONCLUSIÓN FORGE");
    output += `${conclusion}\n`;
  }

  return output;
}

module.exports = {
  section,
  formatNumber,
  bullet,
  check,
  warning,
  renderClientAdvisorPresentation
};
