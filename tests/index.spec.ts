import { test, expect, type Route } from "@playwright/test";

test("concurrent partial loads set aria-disabled while pending", async ({
  page,
}) => {
  // Intercept partial requests and hold them until we explicitly continue
  const pendingRoutes: Route[] = [];
  await page.route(/\/partial/, (route) => {
    pendingRoutes.push(route);
  });

  await page.goto("/");

  // Locators for the four controls and their result targets
  const linkPartial = page.getByTestId("partial-link");
  const linkTemplate = page.getByTestId("partial-template-link");
  const formGetButton = page.getByTestId("partial-form-submit");
  const formPostButton = page.getByTestId("partial-form-post-submit");

  const formGet = page.locator("form[method='get']");
  const formPost = page.locator("form[method='post']");

  const targetPartial = page.locator("#partial-target");
  const targetTemplate = page.locator("#partial-template-target");
  const targetFormGet = page.locator("#partial-form-target");
  const targetFormPost = page.locator("#partial-form-post-target");

  // Sanity: initial targets show placeholder
  await expect(targetPartial).toHaveText("---");
  await expect(targetTemplate).toHaveText("---");
  await expect(targetFormGet).toHaveText("---");
  await expect(targetFormPost).toHaveText("---");

  // Click all controls to initiate partial loads
  await linkPartial.click();
  await linkTemplate.click();
  await formGetButton.click();
  await formPostButton.click();

  // Wait until all 4 requests are intercepted
  await expect.poll(() => pendingRoutes.length).toBe(4);

  // While the requests are pending the controls should have aria-disabled=true
  await expect(linkPartial).toHaveAttribute("aria-disabled", "true");
  await expect(linkTemplate).toHaveAttribute("aria-disabled", "true");
  await expect(formGetButton).toHaveAttribute("aria-disabled", "true");
  await expect(formPostButton).toHaveAttribute("aria-disabled", "true");

  // And they should have aria-busy=true
  await expect(linkPartial).toHaveAttribute("aria-busy", "true");
  await expect(linkTemplate).toHaveAttribute("aria-busy", "true");
  await expect(formGet).toHaveAttribute("aria-busy", "true");
  await expect(formPost).toHaveAttribute("aria-busy", "true");

  // And buttons should also have disabled=true
  await expect(formGetButton).toBeDisabled();
  await expect(formPostButton).toBeDisabled();

  // Now let all intercepted requests continue
  await Promise.all(pendingRoutes.map((route) => route.continue()));

  // Now wait for targets to be updated (they include "PARTIAL" text in the responses)
  await expect(targetPartial).toContainText("PARTIAL");
  await expect(targetTemplate).toContainText("PARTIAL");
  await expect(targetFormGet).toContainText("PARTIAL");
  await expect(targetFormPost).toContainText("PARTIAL");

  // After completion the controls should no longer have aria-disabled=true
  await expect(linkPartial).not.toHaveAttribute("aria-disabled", "true");
  await expect(linkTemplate).not.toHaveAttribute("aria-disabled", "true");
  await expect(formGetButton).not.toHaveAttribute("aria-disabled", "true");
  await expect(formPostButton).not.toHaveAttribute("aria-disabled", "true");

  // And they should no longer have aria-busy=true
  await expect(linkPartial).not.toHaveAttribute("aria-busy", "true");
  await expect(linkTemplate).not.toHaveAttribute("aria-busy", "true");
  await expect(formGetButton).not.toHaveAttribute("aria-busy", "true");
  await expect(formPostButton).not.toHaveAttribute("aria-busy", "true");

  // And buttons should no longer be disabled
  await expect(formGetButton).not.toBeDisabled();
  await expect(formPostButton).not.toBeDisabled();
});
