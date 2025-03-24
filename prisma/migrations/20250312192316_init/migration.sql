-- CreateTable
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    isActive BOOLEAN NOT NULL DEFAULT true,
    user_role VARCHAR(20) DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'manager')), -- Vai trò: user hoặc admin hoặc manager
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE OAuthProvider (
    "id" SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE,
    CONSTRAINT unique_user_provider UNIQUE ("userId", "provider")
);

-- CreateTable
CREATE TABLE PasswordResetToken (
    "id" SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE,
    CONSTRAINT unique_token UNIQUE ("token"),
    CONSTRAINT check_expiry CHECK ("expiresAt" > "createdAt")
);

-- CreateTable
CREATE TABLE UserSession (
    "id" SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE,
    CONSTRAINT unique_session_token UNIQUE ("sessionToken"),
    CONSTRAINT check_expiry CHECK ("expiresAt" > "createdAt")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON Users("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON PasswordResetToken("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionToken_key" ON UserSession("sessionToken");

-- CreateTable
CREATE TABLE time_capsules (
    capsule_id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- Người tạo Capsule
    title VARCHAR(255) NOT NULL,
    capsule_description TEXT,
    scheduled_open_time TIMESTAMP NOT NULL, -- Thời gian mở
    is_shared BOOLEAN DEFAULT FALSE, -- Capsule có thể được chia sẻ không
    is_opened BOOLEAN DEFAULT FALSE, -- Capsule đã được mở hay chưa
    theme_suggestion TEXT, -- Gợi ý chủ đề từ AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE capsule_contents (
    content_id SERIAL PRIMARY KEY,
    capsule_id INT REFERENCES time_capsules(capsule_id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'video', 'audio', 'file'
    content_text TEXT,
    file_url VARCHAR(255), -- Đường dẫn tới tệp trên cloud
    ai_reflection TEXT, -- Phản ánh và hiểu biết từ AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE capsule_comments ( --Lưu bình luận của người dùng về Capsule khác
    comment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- Người bình luận
    capsule_id INT REFERENCES time_capsules(capsule_id) ON DELETE CASCADE, -- Capsule được bình luận
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE recall_questions ( --Lưu câu hỏi hồi tưởng cho người dùng
    question_id SERIAL PRIMARY KEY,
    capsule_id INT REFERENCES time_capsules(capsule_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT, -- Câu trả lời của người dùng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE reported_content (
    report_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL, -- Người báo cáo
    capsule_id INT REFERENCES time_capsules(capsule_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    report_status VARCHAR(20) DEFAULT 'pending' CHECK (report_status IN ('pending', 'resolved', 'rejected')),
    admin_id INT REFERENCES users(user_id) ON DELETE SET NULL, -- Admin xử lý (nếu có)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    capsule_id INT REFERENCES time_capsules(capsule_id) ON DELETE SET NULL,
    log_action VARCHAR(50) NOT NULL, -- 'create', 'open', 'comment', 'report', 'edit'
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);