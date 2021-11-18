import { Router } from "express";
import {home, get_films, create_comment, get_comments, get_characters} from "../controllers/"

let router = Router()

router.get("/", home);
router.get("/api/v1/films", get_films);
router.post("/api/v1/comments", create_comment);
router.get("/api/v1/comments", get_comments);
router.get("/api/v1/characters/:film_id/:sort/:sort_type/:filter", get_characters);


export default router