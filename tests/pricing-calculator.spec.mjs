import { expect, test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pageUrl = `file://${path.resolve(__dirname, "../index.html")}`;

test.describe("public pricing calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pageUrl);
  });

  test("renders without private SKU data", async ({ page }) => {
    await expect(page).toHaveTitle("CXY Wigs 商品定价工具");
    await expect(page.getByRole("heading", { name: "CXY Wigs 商品定价工具" })).toBeVisible();
    await expect(page.getByText("公开在线版不预置真实供应商成本")).toBeVisible();
    await expect(page.locator("#pricingRows tr")).toHaveCount(0);
    await expect(page.getByText("DILISI-")).toHaveCount(0);
  });

  test("adds a product and calculates pricing", async ({ page }) => {
    await page.locator("#newSku").fill("TEST-001");
    await page.locator("#newProduct").fill("Test bob wig");
    await page.locator("#newQty").fill("2");
    await page.locator("#newRmb").fill("200");
    await page.getByRole("button", { name: "添加商品" }).click();
    await expect(page.locator("#pricingRows tr")).toHaveCount(1);
    await expect(page.getByText("TEST-001")).toBeVisible();
    await expect(page.locator("#pricingRows tr").first().locator("td").nth(4)).toHaveText("C$49.27");
    await expect(page.locator("#pricingRows tr").first().locator("td").nth(5)).toHaveText("C$139.00");
  });

  test("updates model when freight changes", async ({ page }) => {
    await page.locator("#freightTotal").fill("1500");
    await expect(page.locator("#landedFactor")).toHaveText("1.32");
    await expect(page.locator("#costPer100")).toHaveText("C$26.78");
  });

  test("loads examples and remains usable on mobile", async ({ page }) => {
    await page.getByRole("button", { name: "加载示例" }).click();
    await expect(page.locator("#pricingRows tr")).toHaveCount(3);
    await expect(page.locator(".controls")).toBeVisible();
    await expect(page.locator(".table-wrap")).toBeVisible();
  });
});
