# 佘秋婧相亲平台 - API接口文档

## 文档版本
- **版本**: v1.0.0
- **创建日期**: 2026-02-05
- **协议**: RESTful API
- **数据格式**: JSON
- **字符编码**: UTF-8
- **Base URL**: `https://api.sheqiujing.com/v1`

---

## 1. 接口通用规范

### 1.1 请求规范

**请求头 (Request Headers)**
```http
Content-Type: application/json
Authorization: Bearer {access_token}
X-Request-ID: {uuid}              // 请求唯一标识
X-Client-Version: 1.0.0          // 客户端版本
X-Device-ID: {device_id}          // 设备标识
X-Platform: ios|android|web       // 平台类型
```

### 1.2 响应规范

**成功响应格式**
```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1707139200000,
  "request_id": "req_123456789"
}
```

**错误响应格式**
```json
{
  "code": 40001,
  "message": "参数错误",
  "data": {
    "errors": [
      {
        "field": "phone",
        "message": "手机号格式不正确"
      }
    ]
  },
  "timestamp": 1707139200000,
  "request_id": "req_123456789"
}
```

### 1.3 错误码定义

| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| 200 | 成功 | 200 |
| 40001 | 参数错误 | 400 |
| 40002 | 缺少必填参数 | 400 |
| 40101 | 未授权，缺少Token | 401 |
| 40102 | Token已过期 | 401 |
| 40103 | Token无效 | 401 |
| 40301 | 权限不足 | 403 |
| 40302 | 账号已被锁定 | 403 |
| 40401 | 资源不存在 | 404 |
| 40901 | 资源冲突（如手机号已注册） | 409 |
| 42901 | 请求过于频繁 | 429 |
| 50001 | 服务器内部错误 | 500 |
| 50002 | 第三方服务错误 | 500 |

### 1.4 分页规范

**请求参数**
```json
{
  "page": 1,           // 页码，从1开始
  "page_size": 20,     // 每页数量，默认20，最大100
  "sort": "created_at", // 排序字段
  "order": "desc"      // 排序方向：asc/desc
}
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

## 2. 用户认证模块

### 2.1 发送验证码

**接口信息**
- **URL**: `/auth/sms-code/send`
- **Method**: POST
- **无需认证**

**请求参数**
```json
{
  "phone": "13800138000",
  "type": "register"  // register-注册 login-登录 reset-重置密码
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": {
    "expire_seconds": 300,
    "send_interval": 60
  }
}
```

**错误码**
- 40001: 手机号格式错误
- 40901: 手机号已注册（type=register时）
- 42901: 发送过于频繁

---

### 2.2 用户注册

**接口信息**
- **URL**: `/auth/register`
- **Method**: POST
- **无需认证**

**请求参数**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "Abc123!@#",
  "invite_code": "ABC123"  // 可选，邀请码
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user_id": 10001,
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": 10001,
      "phone": "138****8000",
      "status": 1,
      "profile_completion_rate": 5,
      "created_at": "2026-02-05T10:30:00Z"
    }
  }
}
```

---

### 2.3 用户登录

**接口信息**
- **URL**: `/auth/login`
- **Method**: POST
- **无需认证**

**请求参数**
```json
{
  "phone": "13800138000",
  "password": "Abc123!@#",
  "device_info": {
    "device_id": "device_xxx",
    "device_type": "ios",
    "device_model": "iPhone14,2",
    "os_version": "16.0",
    "app_version": "1.0.0"
  }
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user_id": 10001,
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "is_new_device": false,
    "user": {
      "id": 10001,
      "nickname": "佘秋婧",
      "avatar_url": "https://oss.xxx.com/avatar/xxx.jpg",
      "vip_level": 2,
      "profile_completion_rate": 85
    }
  }
}
```

---

### 2.4 刷新Token

**接口信息**
- **URL**: `/auth/refresh`
- **Method**: POST
- **无需认证**

**请求参数**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200
  }
}
```

---

### 2.5 提交实名认证

**接口信息**
- **URL**: `/auth/identity-verify`
- **Method**: POST
- **需要认证**

**请求参数**
```json
{
  "real_name": "佘秋婧",
  "id_card_number": "310101199501011234",
  "id_card_front": "base64://...",  // 或先上传获取URL
  "id_card_back": "base64://...",
  "face_photo": "base64://..."
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "实名认证信息已提交",
  "data": {
    "verify_id": 1001,
    "status": "PENDING",  // PENDING-待审核 VERIFYING-验证中 PASSED-已通过 REJECTED-已拒绝
    "estimated_time": "24小时内完成审核",
    "tips": "请保持手机畅通，审核结果将通过短信通知"
  }
}
```

---

## 3. 用户资料模块

### 3.1 获取我的资料

**接口信息**
- **URL**: `/profile`
- **Method**: GET
- **需要认证**

**响应数据**
```json
{
  "code": 200,
  "data": {
    "basic": {
      "user_id": 10001,
      "nickname": "秋秋",
      "real_name": "佘*婧",
      "gender": "female",
      "age": 28,
      "birth_date": "1995-01-01",
      "height_cm": 165,
      "weight_kg": 52.5,
      "blood_type": "A",
      "zodiac": "摩羯座",
      "chinese_zodiac": "猪"
    },
    "location": {
      "hometown": {
        "province": "上海",
        "city": "上海",
        "district": "黄浦区"
      },
      "current": {
        "province": "上海",
        "city": "上海",
        "district": "浦东新区",
        "address": "世纪大道100号"
      }
    },
    "education": {
      "level": "本科",
      "level_code": "BACHELOR",
      "school": "上海交通大学",
      "school_type": "985",
      "major": "工商管理",
      "graduation_year": 2017
    },
    "occupation": {
      "type": "互联网/IT",
      "type_code": "TECH",
      "job_title": "产品经理",
      "company": "某知名互联网公司",
      "company_nature": "民企",
      "work_experience_years": 6
    },
    "economy": {
      "annual_income_range": "20-30万",
      "income_code": "20W_30W",
      "has_house": "有房有贷",
      "house_city": "上海",
      "has_car": "有",
      "car_brand": "宝马"
    },
    "marital": {
      "status": "未婚",
      "status_code": "SINGLE",
      "has_children": false
    },
    "introduction": {
      "self": "热爱生活，喜欢旅行和摄影...",
      "mate_requirements": "希望找到一位成熟稳重...",
      "completion_rate": 85
    },
    "verification": {
      "real_name": "verified",  // verified-已认证 pending-待审核 none-未认证
      "education": "verified",
      "income": "pending",
      "house": "verified",
      "car": "none"
    },
    "photos": {
      "avatar": "https://oss.xxx.com/avatar/xxx.jpg",
      "album": [
        {
          "id": 1,
          "url": "https://oss.xxx.com/photo/1.jpg",
          "thumbnail": "https://oss.xxx.com/photo/1_thumb.jpg",
          "is_primary": true,
          "order": 0
        }
      ],
      "video": {
        "url": "https://oss.xxx.com/video/intro.mp4",
        "cover": "https://oss.xxx.com/video/cover.jpg",
        "duration": 45,
        "view_count": 128
      }
    },
    "interests": [
      {"id": 1, "name": "旅行", "category": "生活"},
      {"id": 2, "name": "摄影", "category": "艺术"},
      {"id": 3, "name": "瑜伽", "category": "运动"}
    ],
    "stats": {
      "view_count": 256,
      "like_count": 32,
      "match_count": 5
    },
    "membership": {
      "level": 2,
      "level_name": "金卡会员",
      "expire_at": "2026-12-31T23:59:59Z"
    }
  }
}
```

---

### 3.2 更新基础资料

**接口信息**
- **URL**: `/profile/basic`
- **Method**: PUT
- **需要认证**

**请求参数**
```json
{
  "nickname": "秋秋",
  "birth_date": "1995-01-01",
  "height_cm": 165,
  "hometown": {
    "province": "上海",
    "city": "上海",
    "district": "黄浦区"
  },
  "current_location": {
    "province": "上海",
    "city": "上海",
    "district": "浦东新区"
  }
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "资料更新成功",
  "data": {
    "completion_rate": 85,
    "updated_fields": ["nickname", "height_cm", "current_location"]
  }
}
```

---

### 3.3 更新择偶要求

**接口信息**
- **URL**: `/profile/mate-requirements`
- **Method**: PUT
- **需要认证**

**请求参数**
```json
{
  "age_min": 28,
  "age_max": 35,
  "height_min": 175,
  "height_max": 185,
  "education_levels": ["BACHELOR", "MASTER", "PHD"],
  "occupation_types": ["TECH", "FINANCE", "EDUCATION"],
  "income_ranges": ["30W_50W", "50W_100W"],
  "marital_status": ["SINGLE"],
  "location_requirements": {
    "same_city": true,
    "acceptable_cities": ["上海", "杭州", "苏州"]
  },
  "other_requirements": "希望对方性格温和..."
}
```

---

### 3.4 上传照片

**接口信息**
- **URL**: `/profile/photos`
- **Method**: POST
- **需要认证**
- **Content-Type**: multipart/form-data

**请求参数**
```
file: [二进制文件]
type: "avatar" | "life"  // 头像或生活照
is_primary: true | false // 是否设为主图
crop_data: {"x": 0, "y": 0, "width": 300, "height": 400} // 裁剪参数（可选）
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "photo_id": 1001,
    "url": "https://oss.xxx.com/photo/1001.jpg",
    "thumbnail": "https://oss.xxx.com/photo/1001_thumb.jpg",
    "status": "PENDING",  // 审核状态
    "tips": "照片已上传，正在审核中"
  }
}
```

---

### 3.5 删除照片

**接口信息**
- **URL**: `/profile/photos/{photo_id}`
- **Method**: DELETE
- **需要认证**

**响应数据**
```json
{
  "code": 200,
  "message": "照片删除成功"
}
```

---

## 4. 匹配推荐模块

### 4.1 获取每日推荐

**接口信息**
- **URL**: `/matching/daily`
- **Method**: GET
- **需要认证**

**请求参数**
```
?page=1&page_size=8
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "refresh_time": "2026-02-05T08:00:00Z",
    "next_refresh_time": "2026-02-06T08:00:00Z",
    "remaining_refreshes": 3,
    "items": [
      {
        "user_id": 20001,
        "nickname": "张先生",
        "age": 30,
        "gender": "male",
        "avatar": "https://oss.xxx.com/avatar/20001.jpg",
        "location": {
          "city": "上海",
          "district": "静安区",
          "distance_km": 5.2
        },
        "basic_info": {
          "height_cm": 180,
          "education": "本科",
          "occupation": "软件工程师",
          "income_range": "35-50万"
        },
        "match_score": 92,
        "match_reasons": [
          "同城，距离5公里",
          "学历相当",
          "收入匹配度高"
        ],
        "photos": [
          "https://oss.xxx.com/photo/1.jpg",
          "https://oss.xxx.com/photo/2.jpg"
        ],
        "tags": ["爱运动", "会做饭", "旅游达人"],
        "interaction_status": null,  // null-未互动 like-喜欢 dislike-不喜欢
        "intro": "热爱生活，喜欢旅行和摄影..."
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 8,
      "total": 8,
      "total_pages": 1
    }
  }
}
```

---

### 4.2 提交匹配互动

**接口信息**
- **URL**: `/matching/interaction`
- **Method**: POST
- **需要认证**

**请求参数**
```json
{
  "target_user_id": 20001,
  "action": "like"  // like-喜欢 dislike-不喜欢 skip-跳过 super_like-超级喜欢
}
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "is_mutual": true,  // 是否双向喜欢
    "is_new_match": true,  // 是否新匹配
    "match_id": 5001,
    "message": "恭喜！你们互相喜欢了，可以开始聊天了",
    "next_recommendation": {
      "user_id": 20002,
      "nickname": "李先生",
      "avatar": "https://oss.xxx.com/avatar/20002.jpg"
    }
  }
}
```

---

### 4.3 获取我的匹配列表

**接口信息**
- **URL**: `/matching/matches`
- **Method**: GET
- **需要认证**

**请求参数**
```
?status=all&page=1&page_size=20
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "match_id": 5001,
        "user": {
          "user_id": 20001,
          "nickname": "张先生",
          "avatar": "https://oss.xxx.com/avatar/20001.jpg",
          "age": 30,
          "location": "上海·静安"
        },
        "matched_at": "2026-02-05T10:30:00Z",
        "last_message": {
          "content": "你好！",
          "time": "2026-02-05T11:00:00Z",
          "is_me": false
        },
        "unread_count": 2,
        "can_unlock_contact": false,  // 是否可以解锁联系方式
        "interaction_days": 0,
        "message_count": 5
      }
    ],
    "stats": {
      "total_matches": 15,
      "new_matches_today": 2,
      "unread_messages": 8
    }
  }
}
```

---

### 4.4 获取喜欢我的人

**接口信息**
- **URL**: `/matching/liked-me`
- **Method**: GET
- **需要认证**

**响应数据**
```json
{
  "code": 200,
  "data": {
    "total_count": 32,
    "new_count": 3,
    "items": [
      {
        "interaction_id": 8001,
        "user": {
          "user_id": 20003,
          "nickname": "王先生",
          "avatar": "https://oss.xxx.com/avatar/20003.jpg",
          "age": 32,
          "location": "上海·徐汇",
          "match_score": 88
        },
        "liked_at": "2026-02-05T09:00:00Z",
        "is_blurred": false,  // VIP用户可查看清晰头像
        "can_see_detail": true
      }
    ]
  }
}
```

---

## 5. 消息模块

### 5.1 获取会话列表

**接口信息**
- **URL**: `/conversations`
- **Method**: GET
- **需要认证**

**响应数据**
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "conversation_id": 1001,
        "user": {
          "user_id": 20001,
          "nickname": "张先生",
          "avatar": "https://oss.xxx.com/avatar/20001.jpg",
          "is_online": true
        },
        "last_message": {
          "message_id": 50001,
          "type": "text",
          "content": "周末有空一起吃饭吗？",
          "time": "2026-02-05T14:30:00Z",
          "is_me": false
        },
        "unread_count": 2,
        "is_pinned": false,
        "is_muted": false,
        "matched_at": "2026-02-05T10:30:00Z"
      }
    ],
    "total_unread": 8
  }
}
```

---

### 5.2 获取消息历史

**接口信息**
- **URL**: `/conversations/{conversation_id}/messages`
- **Method**: GET
- **需要认证**

**请求参数**
```
?before_id=50000&page_size=20  // 获取before_id之前的消息（向上翻页）
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "message_id": 50001,
        "type": "text",
        "content": "你好！很高兴认识你",
        "sender_id": 20001,
        "is_me": false,
        "status": "read",  // sent-已发送 delivered-已送达 read-已读
        "sent_at": "2026-02-05T10:30:00Z",
        "read_at": "2026-02-05T10:35:00Z"
      },
      {
        "message_id": 50002,
        "type": "image",
        "content": "",
        "media_url": "https://oss.xxx.com/msg/50002.jpg",
        "thumbnail": "https://oss.xxx.com/msg/50002_thumb.jpg",
        "sender_id": 10001,
        "is_me": true,
        "status": "read",
        "sent_at": "2026-02-05T10:32:00Z"
      },
      {
        "message_id": 50003,
        "type": "voice",
        "content": "",
        "media_url": "https://oss.xxx.com/msg/50003.mp3",
        "duration": 15,
        "sender_id": 20001,
        "is_me": false,
        "status": "delivered",
        "sent_at": "2026-02-05T10:33:00Z"
      }
    ],
    "has_more": true
  }
}
```

---

### 5.3 发送消息

**接口信息**
- **URL**: `/conversations/{conversation_id}/messages`
- **Method**: POST
- **需要认证**

**请求参数**
```json
{
  "type": "text",  // text|image|voice|video
  "content": "你好！",
  "client_message_id": "client_msg_001",  // 客户端消息ID，用于去重
  "extra": {}
}
```

**发送媒体消息（图片/语音/视频）**
```json
{
  "type": "image",
  "media_url": "https://oss.xxx.com/upload/temp/xxx.jpg",  // 先上传获取临时URL
  "width": 1024,
  "height": 768,
  "client_message_id": "client_msg_002"
}
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "message_id": 50004,
    "type": "text",
    "content": "你好！",
    "sender_id": 10001,
    "is_me": true,
    "status": "sent",
    "sent_at": "2026-02-05T14:35:00Z",
    "seq": 1004
  }
}
```

---

### 5.4 上传媒体文件

**接口信息**
- **URL**: `/messages/upload`
- **Method**: POST
- **需要认证**
- **Content-Type**: multipart/form-data

**请求参数**
```
file: [二进制文件]
type: "image" | "voice" | "video"
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "url": "https://oss.xxx.com/upload/temp/xxx.jpg",
    "thumbnail": "https://oss.xxx.com/upload/temp/xxx_thumb.jpg",
    "width": 1024,
    "height": 768,
    "duration": 0,
    "size": 204800
  }
}
```

---

### 5.5 标记消息已读

**接口信息**
- **URL**: `/conversations/{conversation_id}/read`
- **Method**: PUT
- **需要认证**

**请求参数**
```json
{
  "last_read_message_id": 50003
}
```

---

### 5.6 撤回消息

**接口信息**
- **URL**: `/messages/{message_id}/recall`
- **Method**: PUT
- **需要认证**

**限制**: 发送后2分钟内可撤回

---

## 6. 线下活动模块

### 6.1 获取活动列表

**接口信息**
- **URL**: `/events`
- **Method**: GET
- **可选认证**

**请求参数**
```
?city=上海&status=open&date_from=2026-02-01&date_to=2026-03-01&page=1&page_size=10
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "event_id": 1001,
        "event_code": "SH20260214",
        "name": "上海·高端单身精英相亲会",
        "type": "相亲会",
        "cover_image": "https://oss.xxx.com/event/1001.jpg",
        "event_date": "2026-02-14",
        "start_time": "14:00",
        "end_time": "17:00",
        "location": {
          "city": "上海",
          "district": "静安区",
          "venue": "恒隆广场",
          "address": "南京西路1266号"
        },
        "participants": {
          "max": 50,
          "registered": 32,
          "remaining": 18
        },
        "requirements": {
          "age_range": "25-40",
          "education": "本科及以上"
        },
        "deposit": 200,
        "status": "registering",  // registering-报名中 full-已满 ended-已结束
        "is_registered": false,
        "highlights": ["破冰游戏", "三分钟约会", "心动互选"]
      }
    ]
  }
}
```

---

### 6.2 获取活动详情

**接口信息**
- **URL**: `/events/{event_id}`
- **Method**: GET
- **可选认证**

**响应数据**
```json
{
  "code": 200,
  "data": {
    "event_id": 1001,
    "event_code": "SH20260214",
    "name": "上海·高端单身精英相亲会",
    "type": "相亲会",
    "cover_image": "https://oss.xxx.com/event/1001.jpg",
    "images": ["...", "..."],
    "event_date": "2026-02-14",
    "start_time": "14:00",
    "end_time": "17:00",
    "location": {
      "province": "上海",
      "city": "上海",
      "district": "静安区",
      "venue": "恒隆广场",
      "address": "南京西路1266号",
      "longitude": 121.447,
      "latitude": 31.231
    },
    "description": "诚邀上海市各行各业的优质单身精英...",
    "schedule": [
      {"time": "14:00", "activity": "签到入场"},
      {"time": "14:30", "activity": "破冰游戏"},
      {"time": "15:00", "activity": "三分钟约会"},
      {"time": "16:00", "activity": "茶歇交流"},
      {"time": "16:30", "activity": "心动互选"},
      {"time": "17:00", "activity": "活动结束"}
    ],
    "requirements": {
      "age_range": "25-40",
      "education": "本科及以上",
      "income": "年收入20万以上",
      "other": "有稳定工作，真诚交友"
    },
    "participants": {
      "max": 50,
      "min": 20,
      "registered": 32,
      "male_count": 15,
      "female_count": 17
    },
    "deposit": {
      "amount": 200,
      "is_refundable": true,
      "refund_policy": "活动结束后7天内无投诉则全额退还"
    },
    "organizer": {
      "name": "缘聚红娘团队",
      "phone": "400-xxx-xxxx",
      "avatar": "https://oss.xxx.com/organizer/avatar.jpg"
    },
    "status": "registering",
    "user_registration": {
      "is_registered": false,
      "can_register": true,
      "reason": null  // 如果不能报名，说明原因
    },
    "registered_users": {
      "total": 32,
      "preview": [
        {"user_id": 1001, "avatar": "...", "gender": "female"},
        {"user_id": 1002, "avatar": "...", "gender": "male"}
      ]
    }
  }
}
```

---

### 6.3 报名活动

**接口信息**
- **URL**: `/events/{event_id}/register`
- **Method**: POST
- **需要认证**

**请求参数**
```json
{
  "payment_channel": "wechat"  // wechat|alipay
}
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "registration_id": 5001,
    "registration_no": "REG20260205001",
    "status": "pending_payment",  // pending_payment-待支付 paid-已支付
    "deposit_amount": 200,
    "payment": {
      "order_no": "PAY20260205001",
      "payment_url": "weixin://wxpay/...",  // 微信支付跳转URL
      "expire_time": "2026-02-05T15:00:00Z"
    },
    "event_info": {
      "event_id": 1001,
      "name": "上海·高端单身精英相亲会",
      "event_date": "2026-02-14",
      "location": "恒隆广场"
    }
  }
}
```

---

### 6.4 获取我的活动报名

**接口信息**
- **URL**: `/events/my-registrations`
- **Method**: GET
- **需要认证**

**请求参数**
```
?status=all&page=1&page_size=10
```

**响应数据**
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "registration_id": 5001,
        "registration_no": "REG20260205001",
        "event": {
          "event_id": 1001,
          "name": "上海·高端单身精英相亲会",
          "event_date": "2026-02-14",
          "start_time": "14:00",
          "location": "恒隆广场",
          "cover_image": "https://oss.xxx.com/event/1001.jpg"
        },
        "status": "paid",  // paid-已支付 checked_in-已签到 completed-已完成 refunded-已退款
        "deposit": {
          "amount": 200,
          "paid_at": "2026-02-05T10:30:00Z",
          "refund_status": null,
          "refund_amount": null
        },
        "check_in": {
          "is_checked_in": false,
          "check_in_code": "CHECKIN20260214",
          "qr_code": "https://oss.xxx.com/qrcode/xxx.png"
        },
        "can_cancel": true,
        "can_rate": false,
        "registered_at": "2026-02-05T10:30:00Z"
      }
    ],
    "stats": {
      "total": 5,
      "upcoming": 2,
      "completed": 3
    }
  }
}
```

---

### 6.5 取消报名

**接口信息**
- **URL**: `/events/registrations/{registration_id}/cancel`
- **Method**: PUT
- **需要认证**

**请求参数**
```json
{
  "reason": "临时有事无法参加"
}
```

**限制**: 活动开始前24小时外可取消，保证金自动退还

---

### 6.6 活动签到

**接口信息**
- **URL**: `/events/registrations/{registration_id}/check-in`
- **Method**: POST
- **需要认证**

**请求参数**
```json
{
  "check_in_code": "CHECKIN20260214",  // 或扫码获取
  "location": {
    "longitude": 121.447,
    "latitude": 31.231
  }
}
```

**响应数据**
```json
{
  "code": 200,
  "message": "签到成功",
  "data": {
    "checked_in_at": "2026-02-14T14:05:00Z",
    "welcome_message": "欢迎参加上海·高端单身精英相亲会，祝您找到心仪的对象！"
  }
}
```

---

### 6.7 评价活动

**接口信息**
- **URL**: `/events/registrations/{registration_id}/rate`
- **Method**: POST
- **需要认证**

**请求参数**
```json
{
  "rating": 5,  // 1-5星
  "comment": "活动组织得很好，认识了很多优秀的朋友！",
  "tags": ["组织有序", "嘉宾质量高", "氛围好"]
}
```

---

## 7. WebSocket实时通信

### 7.1 连接建立

**连接地址**: `wss://ws.sheqiujing.com/v1?token={access_token}`

**连接参数**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "device_id": "device_xxx",
  "platform": "ios"
}
```

### 7.2 消息协议

**客户端发送消息格式**:
```json
{
  "type": "message",
  "data": {
    "conversation_id": 1001,
    "content": "你好！",
    "client_message_id": "client_msg_001"
  },
  "timestamp": 1707139200000
}
```

**服务端推送消息格式**:
```json
{
  "type": "new_message",
  "data": {
    "message_id": 50001,
    "conversation_id": 1001,
    "sender_id": 20001,
    "type": "text",
    "content": "你好！",
    "sent_at": "2026-02-05T10:30:00Z"
  },
  "timestamp": 1707139200000
}
```

### 7.3 消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| `ping` | C→S | 心跳检测 |
| `pong` | S→C | 心跳响应 |
| `auth` | C→S | 认证请求 |
| `auth_success` | S→C | 认证成功 |
| `message` | C→S | 发送消息 |
| `new_message` | S→C | 新消息通知 |
| `message_status` | S→C | 消息状态变更 |
| `typing` | C→S | 正在输入 |
| `user_typing` | S→C | 对方正在输入 |
| `match_notification` | S→C | 匹配成功通知 |
| `system_notification` | S→C | 系统通知 |

### 7.4 心跳机制

- **心跳间隔**: 30秒
- **超时时间**: 90秒未收到心跳则断开连接

**心跳消息**:
```json
{
  "type": "ping",
  "timestamp": 1707139200000
}
```

**心跳响应**:
```json
{
  "type": "pong",
  "timestamp": 1707139200000
}
```

---

## 8. 附录

### 8.1 枚举值定义

**Gender（性别）**
- `male` - 男
- `female` - 女

**EducationLevel（学历）**
- `HIGH_SCHOOL` - 高中
- `COLLEGE` - 大专
- `BACHELOR` - 本科
- `MASTER` - 硕士
- `PHD` - 博士
- `POSTDOC` - 博士后

**MaritalStatus（婚姻状况）**
- `SINGLE` - 未婚
- `DIVORCED` - 离异
- `WIDOWED` - 丧偶

**MessageType（消息类型）**
- `text` - 文本
- `image` - 图片
- `voice` - 语音
- `video` - 视频
- `location` - 位置
- `system` - 系统消息

**EventStatus（活动状态）**
- `draft` - 草稿
- `registering` - 报名中
- `full` - 已满员
- `closed` - 报名截止
- `ongoing` - 进行中
- `ended` - 已结束
- `cancelled` - 已取消

### 8.2 时区处理

- 所有时间戳使用 Unix 时间戳（毫秒）
- 服务器存储 UTC 时间
- API 返回 ISO 8601 格式（带时区）
- 客户端负责时区转换

### 8.3 版本兼容性

- API 版本通过 URL 路径控制：`/v1/`, `/v2/`
- 重大变更需升级版本号
- 旧版本 API 保留至少6个月

---

此API文档涵盖了：
1. 完整的接口规范
2. 所有核心功能模块的API
3. 详细的请求/响应示例
4. WebSocket实时通信协议
5. 错误码和枚举值定义

如需继续完善技术架构文档或部署方案，请告诉我！