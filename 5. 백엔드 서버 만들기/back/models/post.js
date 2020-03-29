module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });
  Post.asscoiate = (db) => {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsTo(db.Post, { as : 'Retweet' }); 
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashTag' }); 
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers'}); 
  };
  return Post;
};