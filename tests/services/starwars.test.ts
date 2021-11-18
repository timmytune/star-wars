import 'dotenv/config'
import {is_film, starwarService, film, is_character, is_film_cache_value} from "../../src/services/starWars"



describe('coment service testing', () => {

    beforeAll(async () => {
        //await populate character cache
        await starwarService.get_characters([1, 2, 3, 4, 5, 6])
        //populate film cache 
        await starwarService.get_all_films()

    }, 60000)


    it('check get_all_fils', async () => {

        let film_result = await starwarService.get_all_films()
        
        expect(film_result.films.length).toBeGreaterThan(4)
        expect(film_result.errors.length).toBeLessThan(1)
        expect(starwarService.film_cache.size).toEqual(film_result.films.length)
        expect(starwarService.all_films_cache.length).toEqual(film_result.films.length)

        starwarService.delete_film_cache_data(film_result.films[0].film_id)

        let re = starwarService.film_cache.get(film_result.films[0].film_id)

        expect(re).toBe(undefined)

    }, 10000)

    it('check convert_film', async () => {

        let fil = await starwarService.convert_film({ title: "test", episode_id: 4, opening_crawl: "It is a test ", director: "George Lucas", producer: "Gary Kurtz, Rick McCallum",release_date: "1977-05-25",
            characters: [
                "https://swapi.dev/api/people/1/",
                "https://swapi.dev/api/people/2/",
                "https://swapi.dev/api/people/3/",

            ],
            "created": "2014-12-10T14:23:31.880000Z",
            "edited": "2014-12-20T19:49:45.256000Z",
            "url": "https://swapi.dev/api/films/1/"
        }, false)

        expect(fil).toHaveProperty("film_id")

        fil = await starwarService.convert_film({ title: "test", episode_id: 4, opening_crawl: "It is a test ", director: "George Lucas", producer: "Gary Kurtz, Rick McCallum",release_date: "1977-05-25",
        "created": "2014-12-10T14:23:31.880000Z",
        "edited": "2014-12-20T19:49:45.256000Z",
        "url": "https://swapi.dev/api/films/1/"
    }, false)

    expect(fil).toHaveProperty("length")

    fil = await starwarService.convert_film({ title: "test", episode_id: 4, opening_crawl: "It is a test ", director: "George Lucas", producer: "Gary Kurtz, Rick McCallum",release_date: "1977-05-25",
    characters: [
        "https://swapi.dev/api/people/1/",
        "https://swapi.dev/api/people/2/",
        "https://swapi.dev/api/people/3/",

    ],
    "created": "2014-12-10T14:23:31.880000Z",
    "edited": "2014-12-20T19:49:45.256000Z",
    "url": "https://swapi/1/"
    }, true)

    expect(fil).toHaveProperty("length")
        

    })

    it('check convert_character', async () => {

        let character = await starwarService.convert_character({
            "name": "Luke Skywalker",
            "height": "172",
            "mass": "77",
            "hair_color": "blond",
            "skin_color": "fair",
            "eye_color": "blue",
            "birth_year": "19BBY",
            "gender": "male",
            "created": "2014-12-09T13:50:51.644000Z",
            "edited": "2014-12-20T21:17:56.891000Z",
            "url": "https://swapi.dev/api/people/1/"
        })

        expect(character).toHaveProperty("character_id")

        character = await starwarService.convert_character({
            "name": "Luke Skywalker",
            "height": "172",
            "mass": "77",
            "hair_color": "blond",
            "skin_color": "fair",
            "eye_color": "blue",
            "birth_year": "19BBY",
            "gender": "male",
            "created": "2014-12-09T13:50:51.644000Z",
            "edited": "2014-12-20T21:17:56.891000Z",
        })

    expect(character).toHaveProperty("length")

    })

    it('check film_still_exist', async () => {

        let ret = await starwarService.film_stil_exist(2)

        expect(ret).toBe("")

        ret = await starwarService.film_stil_exist(5000)

        expect(ret).not.toBe("")

    }, 20000)

    it('check get_characters', async () => {

        let ret = await starwarService.get_characters([1, 2])

        expect(ret.characters.length).toBe(2)

        ret = await starwarService.get_characters([3, 5, 1000])

        expect(ret.characters.length).toBe(2)

    },10000)

    it('check add_character_to_cache', async () => {

        await starwarService.add_to_character_cache(900, { 
            character_id: 900,
            name: "test",
            height: 120,
            mass: 100,
            hair_color: "green",
            skin_color: "blue",
            eye_color: "red",
            birth_year: "12-12-12",
            gender: "male",
        })

        expect(starwarService.character_cache.has(900)).toEqual(true)
    })

    it('check add_film_to_cache', async () => {

        let ret = await starwarService.add_to_film_cache(1000, { 
            film_id: 1000,
            title: "test film",
            opening_crawl: "so long ago",
            release_date: "2032 223",
            comments_count: 3,
            characters: [1, 2]
        })

        expect(starwarService.film_cache.has(1000)).toEqual(true)
    })

    it('check get_film_characters', async () => {

        let fi = starwarService.film_cache.get(2)

        if(is_film_cache_value(fi)) {
            fi.film.characters = [1, 2, 3]
            starwarService.add_to_film_cache(1, {...fi.film})
        }

        let chars =  await starwarService.get_film_characters(2)
        expect(chars.characters.length).toEqual(3)
        expect(is_character(chars.characters[0])).toEqual(true)
    }, 10000)


})