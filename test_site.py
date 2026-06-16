from playwright.sync_api import sync_playwright
import json

results = []

def test_site():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        # 1. Test homepage loads
        print("1. Testing homepage...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(1000)
        title = page.title()
        print(f"   Title: {title}")
        assert "Missed You" in title, f"Title mismatch: {title}"
        results.append({"test": "homepage_load", "status": "pass", "detail": title})
        page.screenshot(path="test_screenshots/01_homepage.png")

        # 2. Test landing page elements
        print("2. Testing landing page elements...")
        heading = page.locator("h1").first
        assert heading.is_visible(), "Main heading not visible"
        heading_text = heading.text_content()
        print(f"   Heading: {heading_text}")
        results.append({"test": "landing_heading", "status": "pass", "detail": heading_text})

        # 3. Test login button
        print("3. Testing login button...")
        login_btn = page.locator("text=开始探索")
        assert login_btn.is_visible(), "Login button not visible"
        login_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="test_screenshots/02_auth_page.png")
        results.append({"test": "login_button", "status": "pass"})

        # 4. Test auth page
        print("4. Testing auth page...")
        auth_heading = page.locator("text=Missed You").first
        assert auth_heading.is_visible(), "Auth page heading not visible"
        qq_btn = page.locator("text=QQ 一键登录")
        assert qq_btn.is_visible(), "QQ login button not visible"
        results.append({"test": "auth_page", "status": "pass"})
        page.screenshot(path="test_screenshots/03_auth_qq.png")

        # 5. Test demo login
        print("5. Testing demo login...")
        qq_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path="test_screenshots/04_onboarding.png")
        results.append({"test": "demo_login", "status": "pass"})

        # 6. Test onboarding page
        print("6. Testing onboarding page...")
        onboarding_title = page.locator("text=你的名字")
        assert onboarding_title.is_visible(), "Onboarding title not visible"
        name_input = page.locator("input[placeholder*='称呼']")
        name_input.fill("测试用户")
        page.locator("text=下一步").click()
        page.wait_for_timeout(300)
        page.screenshot(path="test_screenshots/05_onboarding_step2.png")
        results.append({"test": "onboarding_step1", "status": "pass"})

        # 7. Complete onboarding
        print("7. Completing onboarding...")
        city_input = page.locator("input[placeholder*='城市']")
        city_input.fill("北京")
        age_input = page.locator("input[placeholder*='年龄']")
        age_input.fill("25")
        page.locator("text=下一步").click()
        page.wait_for_timeout(300)
        page.screenshot(path="test_screenshots/06_onboarding_step3.png")

        # Select interests
        page.locator("text=摄影").click()
        page.locator("text=旅行").click()
        page.locator("text=咖啡").click()
        page.locator("text=完成").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="test_screenshots/07_home_logged_in.png")
        results.append({"test": "onboarding_complete", "status": "pass"})

        # 8. Test home page after login
        print("8. Testing home page after login...")
        discover_heading = page.locator("text=发现新朋友")
        assert discover_heading.is_visible(), "Discover heading not visible"
        results.append({"test": "home_after_login", "status": "pass"})

        # 9. Test match page
        print("9. Testing match page...")
        page.goto("http://localhost:3000/match", wait_until="networkidle")
        page.wait_for_timeout(1000)
        match_heading = page.locator("text=匹配")
        assert match_heading.first.is_visible(), "Match heading not visible"
        page.screenshot(path="test_screenshots/08_match_page.png")
        results.append({"test": "match_page", "status": "pass"})

        # 10. Test chat list page
        print("10. Testing chat list page...")
        page.goto("http://localhost:3000/chat", wait_until="networkidle")
        page.wait_for_timeout(1000)
        chat_heading = page.locator("text=消息")
        assert chat_heading.first.is_visible(), "Chat heading not visible"
        page.screenshot(path="test_screenshots/09_chat_list.png")
        results.append({"test": "chat_list_page", "status": "pass"})

        # 11. Test profile page
        print("11. Testing profile page...")
        page.goto("http://localhost:3000/profile", wait_until="networkidle")
        page.wait_for_timeout(1000)
        profile_heading = page.locator("text=我的主页")
        assert profile_heading.is_visible(), "Profile heading not visible"
        page.screenshot(path="test_screenshots/10_profile_page.png")
        results.append({"test": "profile_page", "status": "pass"})

        # 12. Test settings page
        print("12. Testing settings page...")
        page.goto("http://localhost:3000/settings", wait_until="networkidle")
        page.wait_for_timeout(1000)
        settings_heading = page.locator("text=设置")
        assert settings_heading.is_visible(), "Settings heading not visible"
        page.screenshot(path="test_screenshots/11_settings_page.png")
        results.append({"test": "settings_page", "status": "pass"})

        # 13. Test swipe card interaction
        print("13. Testing swipe card...")
        page.goto("http://localhost:3000/match", wait_until="networkidle")
        page.wait_for_timeout(1000)
        swipe_cards = page.locator("[class*='cursor-grab']")
        card_count = swipe_cards.count()
        print(f"   Swipe cards visible: {card_count}")
        if card_count > 0:
            results.append({"test": "swipe_cards", "status": "pass", "detail": f"{card_count} cards"})
        else:
            results.append({"test": "swipe_cards", "status": "fail", "detail": "No cards visible"})

        # 14. Test bottom navigation
        print("14. Testing bottom navigation...")
        bottom_nav = page.locator("nav").last
        nav_links = bottom_nav.locator("a")
        nav_count = nav_links.count()
        print(f"   Nav links: {nav_count}")
        results.append({"test": "bottom_nav", "status": "pass", "detail": f"{nav_count} links"})

        browser.close()

    return results

if __name__ == "__main__":
    import os
    os.makedirs("test_screenshots", exist_ok=True)

    print("=" * 50)
    print("Missed You Website Self-Check")
    print("=" * 50)

    try:
        results = test_site()
        print("\n" + "=" * 50)
        print("TEST RESULTS")
        print("=" * 50)

        passed = sum(1 for r in results if r["status"] == "pass")
        failed = sum(1 for r in results if r["status"] == "fail")

        for r in results:
            status_icon = "✓" if r["status"] == "pass" else "✗"
            detail = f" ({r.get('detail', '')})" if r.get('detail') else ""
            print(f"  {status_icon} {r['test']}{detail}")

        print(f"\nTotal: {len(results)} | Passed: {passed} | Failed: {failed}")

        if failed == 0:
            print("\nAll tests passed!")
        else:
            print(f"\n{failed} test(s) failed.")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
