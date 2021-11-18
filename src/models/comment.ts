import {Model, DataTypes, Optional} from "sequelize";
import {sequelize} from "../dbConnection"
  
  // These are all the attributes in the comment model
  export interface CommentAttributes {
    id: number;
    body: string;
    film_id: number;
    ip_address: string;
  }
  
  // Some attributes are optional in `comment.build` and `comment.create` calls
  export interface CommentCreationAttributes extends Optional<CommentAttributes, "id"> {}
  
  export class Comment extends Model<CommentAttributes, CommentCreationAttributes>
    implements CommentAttributes {
    public id!: number;
    public body!: string;
    public film_id!: number;
    public ip_address!: string;
  
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  

  }
  


  
  Comment.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      body: {
        type: new DataTypes.STRING(500),
        allowNull: false,
      },
      film_id: {
        type: new DataTypes.TINYINT,
        allowNull: true,
      },
      ip_address: {
        type: new DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      tableName: "comments",
      sequelize, // passing the `sequelize` instance is required
    }
  );

  