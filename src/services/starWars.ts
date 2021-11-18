
/*
    TYPE: API
    APi has limits so simple caching is imlpemented
*/
import axios, {AxiosResponse, AxiosError} from "axios"
import { commentService } from "./comments"
import {env} from "process"

export interface film {
    film_id: number
    title: string
    opening_crawl: string
    release_date: string
    comments_count: number
    characters: Array<number>
}

export interface film_result {
    films: Array<film>
    errors: Array<string>
}

interface film_chache_value {
    film: film
    timestamp: number
}

export function is_film_cache_value(object: any): object is film_chache_value {
    return object && 'film' in object && 'timestamp' in object;
}

export function is_film(object: any): object is film {
    return object && 'film_id' in object && 'characters' in object;
}


export interface character {
    character_id: number
    name: string,
    height: number,
    mass: number,
    hair_color: string,
    skin_color: string,
    eye_color: string,
    birth_year: string,
    gender: string,
}

export function is_character(object: any): object is character {
    return object && 'name' in object && 'height' in object && 'gender' in object;
}

export interface character_result {
    characters: Array<character>
    errors: Array<string>
}
interface character_cache_value {
    character: character
    timestamp: number
}

export function is_character_cache_value(object: any): object is character_cache_value {
    return object && 'character' in object && 'timestamp' in object;
}




class StarwarsSevice {

    baseURL: string
    films_cache_expire: number
    film_cache_limit: number
    character_cache_expiry: number
    character_cache_limit: number


    film_cache: Map<number, film_chache_value>
    all_films_cache: Array<number>
    all_films_cache_timestamp: number


    character_cache: Map<number, character_cache_value>

  

    constructor(baseURL: string, films_cache_expire: number, character_cache_expiry: number, film_cache_limit: number, character_cache_limit: number){
        //variables that need to be initialized
        this.baseURL = baseURL
        this.films_cache_expire = films_cache_expire
        this.film_cache_limit = film_cache_limit
        this.character_cache_expiry = character_cache_expiry
        this.character_cache_limit = character_cache_limit

        this.film_cache = new Map<number, film_chache_value>()
        this.all_films_cache = []
        this.all_films_cache_timestamp = 0

        this.character_cache = new Map<number, character_cache_value>()
    }
    

    
    async get_all_films(): Promise<film_result> {
        let returned: film_result = {films: [], errors: []}
        try{

            let now = new Date()
            //data in chache as not passed the time limmit so we use
            if(now.valueOf() < this.all_films_cache_timestamp){
                //for all films in the cache
                for (let i = 0; i < this.all_films_cache.length; i++) {
                    const ele = this.all_films_cache[i];
                    //check if the element still exist in the film_cache
                    if(this.film_cache.has(ele)){
                        let f = this.film_cache.get(ele)
                        //Check if object returned is of type film_cache_value, Not checking undefinded becaue we put the films there 
                        if(is_film_cache_value(f)){
                            returned.films.push(f.film)
                        }
                    //Since film is no longer in cache let us get it from the API and save it to cache    
                    }else{
                        //get film from API
                        let ret: AxiosResponse = await axios.get(this.baseURL + `/films/${ele}`)
                        //convert film and get comment count for film
                        let film_instance = await this.convert_film(ret.data, true)
                        //check if a valid film is returned
                        if(is_film(film_instance)){
                            //add film to return list
                            returned.films.push(film_instance)
                            //add film to cache 
                            this.add_to_film_cache(film_instance.film_id, film_instance)
                        }else{
                            //else just add errors to the errors list
                            returned.errors.push(...film_instance)
                        }
                    }
                }
                //since we are using data from cache just return
                return returned
            }

            //Data not in cache so we get fresh ones
            let ret: AxiosResponse = await axios.get(this.baseURL + "/films/")
            // make sure we are working with a valid array 
            let films_dirty = ret.data ? ret.data.results : []
            //convert all films and get comment count
            let film_ids: Array<number> = []
            await Promise.all(
                films_dirty.map(async (ele: any) => {
                    //convert film
                    let film_instance = await this.convert_film(ele, true)
                    //check if instance is film
                    if(is_film(film_instance)){
                        //add film id to film_ids list
                        film_ids.push(film_instance.film_id)
                        //add film to cache becas it is new 
                        this.add_to_film_cache(film_instance.film_id, film_instance)
                        //add film to result
                        returned.films.push(film_instance)
                    }else{
                        //just add the errors
                        returned.errors.push(...film_instance)
                    }
                
                })
            )
            //update all films cache with film_ids
            this.all_films_cache = film_ids
            //update cache expiry time
            let now2 = new Date()
            this.all_films_cache_timestamp = now2.setHours(now2.getHours() + this.films_cache_expire).valueOf()
            //sort result by release date (requirement)
            returned.films.sort((a: film, b: film) => a.release_date.localeCompare(b.release_date))
            //return result
            return returned
        }catch(e: any){
            //let devs know error details
            console.log(e)
            // return error (requirement)
            returned.errors.push(e.message)
            return returned
        }  
    }
    //delete data from film cache only used by the comments servid=ce after update
    delete_film_cache_data(key: number): boolean{
        return this.film_cache.delete(key)
    }
    //convert from data object to film and return all erros as string
    async convert_film(data: any, count_comments: boolean): Promise<film | Array<string>> {
        try{
            let errs: Array<string> = []
            let film_instance: film = {film_id: 0, title: "", opening_crawl: "", comments_count: 0, release_date: "", characters: []}

            let url: string 
            //if url is not string just return an error becase that is where we get the id for the film, don't look at me like that all the objects dont come with an id yet id's are refered to in the urls
            if (typeof data.url !== "string")  return ["invalid id in film data"]
            //get film id from url
            url = data.url.replace(this.baseURL + "/films/", "").replace("/", "")
            film_instance.film_id = parseInt(url)
            //if film id is invalid now then we just return an error because we need the film id
            if(film_instance.film_id == NaN || film_instance.film_id <= 0) return ["invalid id in film data"]
            //populate other fields
            if(data.title) film_instance.title = data.title
            if(data.opening_crawl) film_instance.opening_crawl = data.opening_crawl
            if(data.release_date) film_instance.release_date = data.release_date
            //get comment count from db if count comments is true
            if(count_comments){
                let comments_count = await commentService.countComments({where: {film_id: film_instance.film_id}})
                if(typeof comments_count === "number" ){
                    film_instance.comments_count = comments_count
                }else if(comments_count instanceof Error) {
                    errs.push(comments_count.message)
                }
            }
            //get character ids from the character array of urls, the full url is not useful from the API user perspective and it kind of loks some how on the dev end 
            if(data.characters && data.characters.length){
                let hold: Array<number> = []
                data.characters.forEach((ele: any) => {
                    let url = typeof ele === "string" ? ele : "" 
                    url = url.replace(this.baseURL + "/people/", "").replace("/", "")
                    if(parseInt(url) !== NaN){
                        hold.push(parseInt(url))
                    }else{
                        errs.push(`unable to get people id for film ${film_instance.film_id} from url ${ele}`)
                    }
                });
                film_instance.characters = hold
            }else{
                // return errors if the characters are not included abi which movies does not have characters?
                errs.push(`film ${film_instance.film_id} does not seem to have characters with is technically impossible`)
            }

            if (errs.length > 0) {
                return errs
            }

            return film_instance
    
        }catch(e: any){
            //let devs know error details
            console.log(e)
            // return error as requuired
            return [e.message]
        }  
    }
    //convert data to charcter
    convert_character(data: any): character | Array<string> {
        try{
            let character_instance: character = {character_id: 0, name: "", height: 0, mass: 0, hair_color: "", skin_color: "", eye_color: "", birth_year: "", gender: ""}

            let url: string
            //if url is not string just return an error becase that is where we get the id for the character, don't look at me like that all the objects dont come with an id yet id's are refered to in the urls
            if (typeof data.url !== "string")  return ["invalid id in character data"]
            //get film id from url
            url = data.url.replace(this.baseURL + "/people/", "").replace("/", "")
            character_instance.character_id = parseInt(url)
            // just return an error if the id cant bbe gotten from the url
            if(character_instance.character_id == NaN || character_instance.character_id <= 0 || character_instance.character_id == null) return ["invalid id in character data"]
            //populate other fields
            if(data.name) character_instance.name = data.name
            if(data.height && parseInt(data.height)) character_instance.height = parseInt(data.height)
            if(data.mass && parseInt(data.mass)) character_instance.mass = parseInt(data.mass)
            if(data.hair_color) character_instance.hair_color = data.hair_color
            if(data.skin_color) character_instance.skin_color = data.skin_color
            if(data.eye_color) character_instance.eye_color = data.eye_color
            if(data.birth_year) character_instance.birth_year = data.birth_year
            if(data.gender) character_instance.gender = data.gender

            return character_instance
        }catch(e: any){
            //let devs know error details
            console.log(e)
            // return error as requuired
            return [e.message]
        }  
    }

    async film_stil_exist(id: number): Promise<string> {
        try{
            // we need to reach out to server to see if film exist
            let ret: AxiosResponse = await axios.get(`${this.baseURL}/films/${id}`)
            //convert film data            
            let film_instance = await this.convert_film(ret.data, false)

            if(is_film(film_instance)) return ""
            
            return  "film_id check error"

        }catch(e: any | AxiosError){
            //let devs know error details
            console.log(e)
            //let the user know that the id was not found 
            if( axios.isAxiosError(e)){
                if(e.response && e.response.status === 404){
                    return "film with this id cannot be found"
                }
            }
            return e.message
        }  
    }

    //get characters from list of character ids
    async get_characters(chars: Array<number>): Promise<character_result> {
        //initialize data to return
        let ret: character_result = {characters: [], errors: []}
        try{

            await Promise.all(
                chars.map(async (ele: number) => {
                    //if character is in cache and character timestampo has not expired
                    let now = new Date()
                    let character_cache_instance = this.character_cache.get(ele)
                    if(is_character_cache_value(character_cache_instance) && now.valueOf() < character_cache_instance.timestamp){
                        ret.characters.push(character_cache_instance.character)
                    }else {
                        //else just get the character from the api
                        let get_character: AxiosResponse = await axios.get(`${this.baseURL}/people/${ele}`)
                        //convert character
                        let character_instance = this.convert_character(get_character.data)
                        if(is_character(character_instance)){
                            ret.characters.push(character_instance)
                            this.add_to_character_cache(character_instance.character_id, character_instance)
                        }else{
                            ret.errors.push(...character_instance)
                        }
                    }

                })
            )
            return ret
        }catch(e: any){
            //let devs know error details
            console.log(e)
            if(axios.isAxiosError(e) && e.response && e.response.status === 404){
            // return error as required
                ret.errors.push("one of the character_id is invalid")
            }else(
                ret.errors.push(e.message)
            )
            return ret
        }  
    }

    //add character to cache
    add_to_character_cache(key: number, val: character) {
        // if cache size is bigger or equal to limit remove first item since the order of insertion is maintained 
        if(this.character_cache.size >= this.character_cache_limit) {
        let keys = this.character_cache.keys()
        let key = keys.next()
        this.character_cache.delete(key.value)
        }
        let now = new Date()
        this.character_cache.set(key, {character: val, timestamp: now.setHours(now.getHours() + this.character_cache_expiry).valueOf()})
    }

    //add film to cache
    add_to_film_cache(key: number, val: film) {
        // if cache size is bigger or equal to limit remove first item since the order of insertion is maintained 
        if(this.film_cache.size >= this.film_cache_limit) {
        let keys = this.film_cache.keys()
        let key = keys.next()
        this.film_cache.delete(key.value)
        }
        let now = new Date()
        this.film_cache.set(key, {film: val, timestamp: now.setHours(now.getHours() + this.films_cache_expire).valueOf()})
    }

    //return all characters featured in a film
    async get_film_characters(film_id: number): Promise<character_result> {
        let ret: character_result = {characters: [], errors: []}
        try{
            //try to get film from cache and if it is available and hascnot expired 
            let film_instance: film
            let film_cache_value_instance = this.film_cache.get(film_id)
            let now = new Date()
            if(is_film_cache_value(film_cache_value_instance) && now.valueOf() < film_cache_value_instance.timestamp){
                film_instance = film_cache_value_instance.film
            }else{
                //else just get the film from the api
                let res = await axios.get(`${this.baseURL}/films/${film_id}`)
                //convert film data
                let film_instance2 = await this.convert_film(res.data, false)
                if(is_film(film_instance2)){
                    film_instance = film_instance2
                    this.add_to_film_cache(film_instance2.film_id, film_instance2)
                }else{
                    ret.errors.push(...film_instance2)
                    return ret
                }
            }
            
            return await this.get_characters(film_instance.characters)
        }catch(e: any | AxiosError){
            //let devs know error details
            console.log(e)
                        // return error as required
            ret.errors.push(e.message)
            return ret
        }  
    }


}

let swapi_base: string = env.SWAPI_BASE ? env.SWAPI_BASE : "https://swapi.dev/api"
let film_cache_time: number = env.FILM_CACHE_TIME ? parseInt(env.FILM_CACHE_TIME) : 2
let character_cache_time: number = env.CHARACTER_CACHE_TIME ? parseInt(env.CHARACTER_CACHE_TIME) : 2
let film_cache_limit: number = env.FILM_CACHE_LIMIT ? parseInt(env.FILM_CACHE_LIMIT) : 200
let character_cache_limit: number = env.CHARACTER_CACHE_LIMIT ? parseInt(env.CHARACTER_CACHE_LIMIT) : 200

export const starwarService: StarwarsSevice = new StarwarsSevice(swapi_base, film_cache_time, character_cache_time, film_cache_limit, character_cache_limit)