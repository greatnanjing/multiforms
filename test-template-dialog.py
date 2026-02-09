"""Test template dialog select dropdown issue"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(
        viewport={'width': 1280, 'height': 720}
    )
    page = context.new_page()

    print("Navigating to admin templates page...")
    page.goto('http://localhost:3000/admin/templates')
    page.wait_for_load_state('networkidle')

    # Take initial screenshot
    page.screenshot(path='debug-1-templates-list.png')
    print("Screenshot saved: debug-1-templates-list.png")

    # Find and click edit button on first template
    print("Looking for edit button...")
    edit_buttons = page.locator('button:has-text("编辑")').all()
    print(f"Found {len(edit_buttons)} edit buttons")

    if len(edit_buttons) > 0:
        edit_buttons[0].click()
        page.wait_for_timeout(500)
        page.screenshot(path='debug-2-dialog-opened.png')
        print("Screenshot saved: debug-2-dialog-opened.png")

        # Switch to questions tab
        print("Switching to questions tab...")
        questions_tab = page.locator('text=题目设置')
        if questions_tab.is_visible():
            questions_tab.click()
            page.wait_for_timeout(300)
            page.screenshot(path='debug-3-questions-tab.png')
            print("Screenshot saved: debug-3-questions-tab.png")

            # Click on expand button for first question
            print("Looking for expand button...")
            expand_buttons = page.locator('button[title*="展开"]').all()
            if len(expand_buttons) > 0:
                expand_buttons[0].click()
                page.wait_for_timeout(300)
                page.screenshot(path='debug-4-question-expanded.png')
                print("Screenshot saved: debug-4-question-expanded.png")

                # Try to click on select dropdown
                print("Looking for select dropdown...")
                select_dropdown = page.locator('select').first
                if select_dropdown.is_visible():
                    print(f"Select dropdown found! Value: {select_dropdown.input_value()}")

                    # Click on select to open dropdown
                    select_dropdown.click()
                    page.wait_for_timeout(1000)
                    page.screenshot(path='debug-5-select-opened.png')
                    print("Screenshot saved: debug-5-select-opened.png")

                    # Check if dialog is still open
                    dialog_visible = page.locator('text=题目设置').is_visible()
                    print(f"Dialog still visible after clicking select: {dialog_visible}")

                    # Try to select an option
                    options = page.locator('option').all()
                    print(f"Found {len(options)} options in select")

                    if len(options) > 1:
                        print(f"Clicking second option: {options[1].text_content()}")
                        options[1].click()
                        page.wait_for_timeout(500)
                        page.screenshot(path='debug-6-option-selected.png')
                        print("Screenshot saved: debug-6-option-selected.png")

                        # Check if dialog is still open
                        dialog_visible = page.locator('text=题目设置').is_visible()
                        print(f"Dialog still visible after selecting option: {dialog_visible}")
                else:
                    print("Select dropdown not found!")
            else:
                print("No expand button found")
        else:
            print("Questions tab not found")
    else:
        print("No edit button found!")

    # Wait to see result
    page.wait_for_timeout(2000)
    page.screenshot(path='debug-7-final.png')
    print("Final screenshot saved: debug-7-final.png")

    browser.close()
    print("Test complete!")
