SELECT JSON_BUILD_OBJECT( 'id', p.post_id, 'text', p.post_text, 'createdat', p.created_at, 'comments', JSON_AGG( JSON_BUILD_OBJECT( 'id', c.comment_id, 'text', c.comment_text, 'createdat', c.created_at, 'user', JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username ) ) ) ) AS post FROM "Posts" p LEFT JOIN "Comments" c ON p.post_id = c.post_id LEFT JOIN "User" u ON c.comment_user = u.id WHERE p.post_id = $1 GROUP BY p.post_id;

SELECT c.*, p.post_text FROM "Comments" c JOIN "Posts" p ON c.post_id = p.post_id WHERE p.post_id = $1







SELECT JSON_BUILD_OBJECT( 'id', p.post_id, 'comment_text', p.post_text, 'created_at', p.created_at, 'post_user', JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username ), 'comments', JSON_AGG( JSON_BUILD_OBJECT( 'id', c.comment_id, 'text', c.comment_text, 'createdat', c.created_at, 'user', JSON_BUILD_OBJECT( 'id', uc.id, 'username', uc.username ) ) ORDER BY c.created_at DESC ) ) AS post FROM "Posts" p LEFT JOIN "Comments" c ON p.post_id = c.post_id LEFT JOIN "User" u ON p.post_user = u.id LEFT JOIN "User" uc ON c.comment_user = uc.id WHERE p.post_id = $1 GROUP BY p.post_id, u.id, uc.id;

SELECT JSON_BUILD_OBJECT( 'id', p.post_id, 'text', p.post_text, 'createdat', p.created_at, 'user', JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username ), 'comments', JSON_AGG( JSON_BUILD_OBJECT( 'id', c.comment_id, 'text', c.comment_text, 'createdat', c.created_at, 'user', JSON_BUILD_OBJECT( 'id', uc.id, 'username', uc.username ) ) ORDER BY c.created_at DESC ) ) AS post FROM "Posts" p LEFT JOIN "User" u ON p.post_user = u.id LEFT JOIN "Comments" c ON p.post_id = c.post_id LEFT JOIN "User" uc ON c.comment_user = uc.id WHERE p.post_id = $1 GROUP BY p.post_id, u.id;

SELECT JSON_BUILD_OBJECT( 'id', p.post_id, 'text', p.post_text, 'createdat', p.created_at, 'user', JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username ), 'comments', COALESCE(JSON_AGG( JSON_BUILD_OBJECT( 'id', c.comment_id, 'text', c.comment_text, 'createdat', c.created_at, 'user', JSON_BUILD_OBJECT( 'id', uc.id, 'username', uc.username ) ) ORDER BY c.created_at DESC ), '[]'::json) ) AS post FROM "Posts" p LEFT JOIN "User" u ON p.post_user = u.id LEFT JOIN "Comments" c ON p.post_id = c.post_id LEFT JOIN "User" uc ON c.comment_user = uc.id WHERE p.post_id = $1 GROUP BY p.post_id, u.id;


user: {
  id:
  username:
  full_name:
      posts:
           post_id:
            post_text:
            created_at:
            like_count:
}

SELECT JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username, 'fullname', u.fullname, 'posts', JSON_AGG( JSON_BUILD_OBJECT( 'post_id', p.post_id, 'post_text', p.post_text, 'created_at', p.created_at, 'like_count', p.like_count ) ) ) AS user FROM "User" u LEFT JOIN "Posts" p ON u.id = p.post_user GROUP BY u.id, u.username, u.fullname;





SELECT JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username, 'full_name', u.full_name, 'posts', JSON_AGG( JSON_BUILD_OBJECT( 'post_id', p.post_id, 'post_text', p.post_text, 'created_at', p.created_at, 'like_count', COALESCE(p.like_count, 0) ) ) ) AS user FROM "User" u LEFT JOIN "Posts" p ON u.id = p.post_user GROUP BY u.id, u.username, u.full_name;


SELECT JSON_BUILD_OBJECT( 'id', p.post_id, 'text', p.post_text, 'createdat', p.created_at, 'user', JSON_BUILD_OBJECT('id', u.id, 'username', u.username), 'comments', JSON_AGG( JSON_BUILD_OBJECT( 'comment_id', c.comment_id, 'comment_text', c.comment_text, 'created_at', c.created_at, 'user', JSON_BUILD_OBJECT('id', uc.id, 'username', uc.username) ) ORDER BY c.created_at DESC ), 'is_liked', EXISTS ( SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = $1 ) ) AS post FROM "Posts" p LEFT JOIN "Comments" c ON p.post_id = c.post_id LEFT JOIN "User" u ON p.post_user = u.id LEFT JOIN "User" uc ON c.comment_user = uc.id WHERE p.post_id = $1 GROUP BY p.post_id, u.id, uc.id;
