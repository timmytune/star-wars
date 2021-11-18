import { Request, Response } from "express";
import { Op } from "sequelize";
import { commentService } from "../services/comments";
import { Comment, CommentAttributes } from "../models/comment";
import { character, starwarService } from "../services/starWars";
import { FindOptions } from "sequelize/types";
import { cm_to_feet } from "../helpers";

export let home = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({message: "Welcome to the star wars API"});
}

//get all films
export let get_films = async (req: Request, res: Response): Promise<Response> => {
    try{
        //get film from service
        let films = await starwarService.get_all_films()
        
        if(films.errors.length > 0 && films.films.length == 0) {
            //It is an internal error if we have errors with no films
            return res.status(500).json({message: "no films returned", errors: films.errors, data: films.films})
        }else if(films.errors.length > 0 && films.films.length > 0) {
            //Films returned with errors so return that
            return res.status(206).json({message: "films returned but with some errors", errors: films.errors, data: films.films})
        }

        //return result
        return res.status(200).send({message: "loaded data", data: films.films});
    } catch (e: any) {
        //let devs know error details
        console.log(e)
        // return error as required
        return res.status(500).send({message: "request failed", errors: [e.message]});
    }
}

//create comment
export let create_comment = async (req: Request, res: Response): Promise<Response> => {
    try {

        let film_id: number = parseInt(req.body.film_id)
        let body: string = req.body.body

        let errs: Array<string> = []
    
        if(!film_id || film_id == NaN || film_id < 1)  errs.push("you have to provide a valid fiml_id(type number)")
        
        if(!body || !body.trim()) errs.push("you have to provide a valid body(type string) not more than 500 chatacters")
        //check if comment exist and is accessible from the api if not return error
        if(errs.length) return res.status(400).json({message: "request error", errors: errs})

        let message = await starwarService.film_stil_exist(film_id)
        if(message != ""){
            errs.push(message)
        }

        if(errs.length) return res.status(400).json({message: "request error", errors: errs})
        //create comment
        let com = await commentService.createComment({film_id: film_id, body: body.trim(), ip_address: req.ip })
    
        if (com instanceof Comment) {
            return res.status(200).json({message: "comment created successfully", data: com})
        }else if(typeof com === "string"){
            return res.status(400).send({message: "error in request", errors: [com]});
        }
    
        //console.log("invalid-create-comment-data: ", com)
        return res.status(500).send({message: "unable to create comment", errors: ["unable to create comment"]});
        
    } catch (e: any) {
        //let devs know error details
        console.log(e)
        // return error as required
        return res.status(500).send({message: "request failed", errors: [e.message]});
    }
}

//get comments
export let get_comments = async (req: Request, res: Response): Promise<Response> => {
    try {

        let query:FindOptions<CommentAttributes> = {}
        
        query.limit = 100
        query.order = [["body", "DESC"]]
        
        if(typeof req.query.film_id === "string" && parseInt(req.query.film_id) > 0) {
            query.where = {film_id: parseInt(req.query.film_id)}
        }else if(req.query.film_id){
            return res.status(400).send({message: "unable to get comments", errors: ["Invalid film_id provided"]});
        }

        if(typeof req.query.page === "string" && parseInt(req.query.page) > 0) {
            let page: number = parseInt(req.query.page)
            query.offset = (page - 1) * query.limit
        }else if(req.query.page){
            return res.status(400).send({message: "unable to get comments", errors: ["Invalid page provided"]});
        }

        if(typeof req.query.search === "string" && req.query.search.trim() != "") {
            if(query.where === undefined) query.where = {}
            query.where = {...query.where, body: {[Op.substring]: req.query.search.trim()}}
        }
        //get comments from service
        let coms = await commentService.getComments(query)
        if(coms instanceof Array){
            let commsCount = await commentService.countComments(query)
            if(typeof commsCount  === "number"){
                return res.status(200).json({message: "comment loaded successfully", page: typeof req.query.page === "string" && parseInt(req.query.page) > 0 ? req.query.page : 1, total: commsCount, data: coms})
            }else{
                return res.status(2006).json({message: "comment loaded with error", errors: [commsCount.message],  page: typeof req.query.page === "string" && parseInt(req.query.page) > 0 ? req.query.page : 1, data: coms})
            }
        }
  
        return res.status(400).send({message: "unable to get comments", errors: [coms.message]});
        
    } catch (error: any) {
        return res.status(500).send({message: "get comments error", errors: [error.message]});
    }
}

// get characters
export let get_characters = async (req: Request, res: Response): Promise<Response> => {
    try{
        //check film_id parameter
        let film_id: number = parseInt(req.params.film_id)
        if(!film_id || film_id === NaN){
            return res.status(400).send({message: "request failed", errors: ["invalid film_id parameter expecting a valid number"]});
        }

        //check sort parameter
        let sort: string = req.params.sort ? req.params.sort.trim() : "" 
        if(sort != "name" && sort != "gender" && sort != "height"){
            return res.status(400).send({message: "invalid request", errors: ["sort parameter can only be either of name|gender|height"]});
        }


        //check sort_type
        let sort_type: string = req.params.sort_type ? req.params.sort_type.trim() : "" 
        if(sort_type != "asc" && sort_type != "dsc" ){
            return res.status(400).send({message: "invalid request", errors: ["sort_type parameter can only be either of asc|dsc"]});
        }

        let filter: string = req.params.filter ? req.params.filter.trim() : "" 

        // et film characters from provided film_id
        let characters = await starwarService.get_film_characters(film_id)

        let total_height: number = 0

        //filter first so that filtering with not disrupt sorting
        if (filter !== "all" && filter !== "na") {
            characters.characters = characters.characters.filter((v: character, i: number) => { 
               if(v.gender === filter){
                total_height += v.height
                return true
               }
               return false
            })
        }else if(filter === "na"){
            characters.characters = characters.characters.filter((v: character, i: number) => {                
            if(v.gender === "n/a"){
                total_height += v.height
                return true
               }
               return false
            })
        }else{
            //we are not filtering for all so we just calculate the height
            for (let i = 0; i < characters.characters.length; i++) {
                const ele = characters.characters[i];
                total_height += ele.height
            }
        }

        //then we sort accoe=rding to specification
        switch (sort) {
            case "name":
                characters.characters = characters.characters.sort((a: character, b: character) => {
                    if(sort_type === "asc"){
                        return a.name.localeCompare(b.name)
                    }
                    return b.name.localeCompare(a.name)
                })
                break;

            case "gender":
                characters.characters = characters.characters.sort((a: character, b: character) => {
                    if(sort_type === "asc"){
                        return a.gender.localeCompare(b.gender)
                    }
                    return b.gender.localeCompare(a.gender)
                })
                break;
        
            case "height":
                characters.characters = characters.characters.sort((a: character, b: character) => {
                    if(sort_type === "asc"){
                        return a.height - b.height
                    }
                    return b.height - a.height
                })
                break;
        }
 
        //convert height to feet and inches
        let re = cm_to_feet(total_height)

        if(characters.errors.length > 0 && characters.characters.length == 0) {
            //It is an internal error if we have errors with no films
            return res.status(400).json({message: "no character returned", errors: characters.errors, data: characters.characters})
        }else if(characters.errors.length > 0 && characters.errors.length > 0) {
            //Films returned with errors so return that
            return res.status(206).json({message: "characters returned but with some errors", total_height_feet_inches: `${re.feet} Feet ${re.inches} Inches`, errors: characters.errors, data: characters.characters, characters_total: characters.characters.length, total_height_cm: total_height})
        }

        //return valid response
        return res.status(200).send({message: "loaded data", characters_total: characters.characters.length, total_height_cm: total_height,  total_height_feet_inches: `${re.feet} Feet ${re.inches} Inches`,  data: characters.characters});
    } catch (e: any) {
        //let devs know error details
        console.log(e)
        // return error as required
        return res.status(500).send({message: "request failed", errors: [e.message]});
    }
}

