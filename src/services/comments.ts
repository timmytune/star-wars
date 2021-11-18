/*
    type model
*/
import { FindOptions, NonNullFindOptions } from "sequelize/types";
import { Comment, CommentAttributes, CommentCreationAttributes } from "../models/comment";
import { starwarService } from "./starWars";


class CommentSevice {
    //get comments
    async getComments(query: FindOptions<CommentAttributes>): Promise<Comment[] | Error> {
        try {
            return await Comment.findAll(query)
        } catch  (e: any) {
            return e
        }

    }
    // count comments
    async countComments(query: FindOptions<CommentAttributes>): Promise<number | Error> {
        try {
            return await Comment.count(query)
        } catch (e: any) {
            return e
        }
   
    }
    //get single comment
    async getComment(id: number): Promise<Comment | string> {
        try{
        let query: NonNullFindOptions<Comment> = {where: {id: id}, rejectOnEmpty: true}
            return await Comment.findOne(query)
        }catch(e: any){
            return e.message
        }
    }
    //create comment
    async createComment(com: CommentCreationAttributes): Promise<Comment | string> {
        try {
            let ret = await Comment.create(com)
            //delete film from cache so the comment count can be updated
            starwarService.delete_film_cache_data(com.film_id)
            return ret
        } catch (e: any) {
            return e.message
        }

        
    }
}

export const commentService: CommentSevice = new CommentSevice()