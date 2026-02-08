/* ============================================
   MultiForms RLS 诊断脚本

   检查当前 RLS 策略和函数状态
============================================ */

-- 1. 检查函数是否存在
SELECT
    proname as function_name,
    prosrc as function_body,
    prosecdef as is_security_definer
FROM pg_proc
WHERE proname IN ('can_insert_submission', 'can_view_form', 'can_view_questions', 'is_admin')
AND pronamespace = 'public'::regnamespace;

-- 2. 检查 form_submissions 表的所有策略
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'form_submissions';

-- 3. 检查 forms 表的所有策略
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'forms';

-- 4. 检查 form_questions 表的所有策略
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'form_questions';

-- 5. 测试 can_insert_submission 函数
-- 替换 YOUR_FORM_ID 为实际的表单 ID
DO $$
DECLARE
    test_form_id UUID := '00000000-0000-0000-0000-000000000000'::UUID; -- 占位符
    can_submit BOOLEAN;
    form_record RECORD;
BEGIN
    -- 获取第一个已发布的表单
    SELECT id, status, access_type
    INTO form_record
    FROM public.forms
    WHERE status = 'published'
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE NOTICE '没有找到已发布的表单进行测试';
        RETURN;
    END IF;

    RAISE NOTICE '测试表单: ID=%, Status=%, AccessType=%',
        form_record.id, form_record.status, form_record.access_type;

    -- 测试函数
    SELECT public.can_insert_submission(form_record.id)
    INTO can_submit;

    RAISE NOTICE 'can_insert_submission(%) 结果: %', form_record.id, can_submit;
END $$;

-- 6. 检查表单状态
SELECT
    id,
    title,
    status,
    access_type,
    expires_at,
    max_responses,
    response_count
FROM public.forms
ORDER BY created_at DESC
LIMIT 5;
