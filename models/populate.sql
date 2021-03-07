use FarmApp;

-- INSERT INTO followers VALUES (7,6);
-- INSERT INTO followers VALUES (7,5);
-- select * from followers;

-- select user_id from User;

-- select item_id from items;

-- select * from posts;
select * from posts where user_id in (select user_id from followers where follower_id=5);