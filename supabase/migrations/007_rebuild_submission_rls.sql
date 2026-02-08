/* ============================================
   MultiForms 完整重建 RLS 策略

   这个脚本会：
   1. 删除 form_submissions 表的所有策略
   2. 重新创建正确的策略
   3. 确保没有冲突
============================================ */

-- 1. 删除 form_submissions 表的所有策略
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow anonymous insert for testing" ON public.form_submissions;
DROP POLICY IF EXISTS "Form owners can view submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.form_submissions;

-- 2. 重新创建策略（按正确顺序）

-- SELECT 策略：表单所有者可以查看提交
CREATE POLICY "Form owners can view submissions"
    ON public.form_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.forms
            WHERE forms.id = form_submissions.form_id
            AND forms.user_id = auth.uid()
        )
    );

-- SELECT 策略：管理员可以查看所有提交
CREATE POLICY "Admins can view all submissions"
    ON public.form_submissions FOR SELECT
    USING (public.is_admin());

-- SELECT 策略：用户可以查看自己的提交
CREATE POLICY "Users can view own submissions"
    ON public.form_submissions FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT 策略：允许任何人插入（包括匿名用户）
CREATE POLICY "Allow anonymous insert"
    ON public.form_submissions FOR INSERT
    WITH CHECK (true);

-- 3. 验证策略已创建
SELECT
    'form_submissions 表的策略:' as info,
    policyname as policy_name,
    cmd as command
FROM pg_policies
WHERE tablename = 'form_submissions'
ORDER BY cmd, policyname;

-- 4. 检查 RLS 和 INSERT 策略状态
SELECT
    CASE
        WHEN relrowsecurity THEN '✓ RLS 已启用'
        ELSE '✗ RLS 未启用'
    END as rls_status,
    (
        SELECT COUNT(*)
        FROM pg_policies
        WHERE tablename = 'form_submissions'
        AND cmd = 'INSERT'
    ) as insert_policy_count,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'form_submissions'
            AND cmd = 'INSERT'
        ) THEN '✓ 存在 INSERT 策略'
        ELSE '✗ 不存在 INSERT 策略 - 所有 INSERT 都被拒绝！'
    END as insert_policy_status
FROM pg_class
WHERE relname = 'form_submissions'
AND relnamespace = 'public'::regnamespace;
