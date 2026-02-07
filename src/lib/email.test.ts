import { replaceDynamicFields } from "./email";

// ─── replaceDynamicFields ───
describe("replaceDynamicFields", () => {
  it("replaces single field", () => {
    const result = replaceDynamicFields("Merhaba {candidateName}", {
      "{candidateName}": "Ahmet Yılmaz",
    });
    expect(result).toBe("Merhaba Ahmet Yılmaz");
  });

  it("replaces multiple fields", () => {
    const template = "{candidateName} - {firmName} - {position}";
    const result = replaceDynamicFields(template, {
      "{candidateName}": "Ayşe Kaya",
      "{firmName}": "ABC A.Ş.",
      "{position}": "Yazılım Mühendisi",
    });
    expect(result).toBe("Ayşe Kaya - ABC A.Ş. - Yazılım Mühendisi");
  });

  it("replaces all occurrences of same field", () => {
    const result = replaceDynamicFields(
      "Sayın {candidateName}, {candidateName} olarak sizi bekliyoruz.",
      { "{candidateName}": "Ali Demir" }
    );
    expect(result).toBe("Sayın Ali Demir, Ali Demir olarak sizi bekliyoruz.");
  });

  it("returns original if no matching fields", () => {
    const result = replaceDynamicFields("Statik metin", {
      "{candidateName}": "Test",
    });
    expect(result).toBe("Statik metin");
  });

  it("handles empty fields object", () => {
    const result = replaceDynamicFields("Merhaba {candidateName}", {});
    expect(result).toBe("Merhaba {candidateName}");
  });
});
