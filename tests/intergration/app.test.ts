import 'dotenv/config'
import { request } from "../helpers"
import { Comment } from "../../src/models/comment";
import { character, is_character, starwarService } from '../../src/services/starWars';


describe('routes', () => {

    beforeAll(async () => {
        //await populate character cache
        await starwarService.get_film_characters(6)
        //populate film cache 
        await starwarService.get_all_films()

    }, 1200000)

    afterAll(async () => {

        await Comment.destroy({
            where: {},
            truncate: true
          })
        //await sequelize.close()
        
    })


    describe('check get all films ', () => {
        it('should return list if star wars movies', async () => {

            const {body: data} = await request.get(`/api/v1/films`).expect(200)

            expect(data.data).toHaveProperty("length")
        }, 20000)
    })

    describe('check homepage', () => {
        it('should return hompage without issues', async () => {
            const {body: data} = await request.get('/').expect(200)
            expect(data).toHaveProperty("message")
            expect(data.message).toEqual("Welcome to the star wars API")
        })
    })

    describe('check cereate comments', () => {

        it('should creste comment without issues', async () => {
            const {body: data} = await request.post('/api/v1/comments').send({"film_id": 2, "body": "zipo gba fun won ooooo baba2"}).expect(200)
            expect(data).toHaveProperty("data")
            expect(data.data).toHaveProperty(["id"])
        }, 20000)

        it('should return error', async () => {
            const {body: data} = await request.post('/api/v1/comments').expect(400)
            expect(data).toHaveProperty("errors")
        }, 20000)

        it('should return error', async () => {
            await request.post('/api/v1/comments').send({"film_id": 2000, "body": "zipo gba fun won ooooo baba2"}).expect(400)
        }, 20000)

    })

    describe('check get comments', () => {

        it('should get comment without issues', async () => {
            const {body: data} = await request.get('/api/v1/comments').expect(200)
            expect(data).toHaveProperty("data")
        }, 20000)

        it('should return without error for search query', async () => {
            const {body: data} = await request.get('/api/v1/comments').query({search: "bbbbbbbbbbbbbbb"}).expect(200)
            expect(data).toHaveProperty("data")
            expect(data.data.length).toEqual(0)
        }, 20000)

        it('should return without error fpr page query', async () => {
            const {body: data} = await request.get('/api/v1/comments').query({page: 100}).expect(200)
            expect(data).toHaveProperty("data")
            expect(data.data.length).toEqual(0)
        }, 20000)

        it('should return without error fpr page query', async () => {
            await request.get('/api/v1/comments').query({page: "ggggg"}).expect(400)
        }, 20000)

        it('should return without error', async () => {
            const {body: data} = await request.get('/api/v1/comments').query({film_id: 2}).expect(200)
            expect(data).toHaveProperty("data")
            expect(data.data.length).toBeGreaterThanOrEqual(1)
        }, 20000)

    })

    
    describe('check get characters', () => {

        let char: character 
        it('should get characters without issues', async () => {
            const {body: data} = await request.get("/api/v1/characters/6/height/asc/all").expect(200)
            expect(data).toHaveProperty("data")
            expect(data.characters_total).toBeGreaterThanOrEqual(34)
            if(is_character(data.data[0])) char = data.data[0]
        }, 60000)

        it('should return characters without issues', async () => {
            const {body: data} = await request.get('/api/v1/characters/6/height/dsc/all').expect(200)
            expect(data).toHaveProperty("data")
            expect(data.data[data.data.length - 1].character_id).toEqual(char.character_id)
        }, 20000)

        it('should return an empty result set', async () => {
            const {body: data} = await request.get('/api/v1/characters/6/height/dsc/yinka').expect(200)
            expect(data).toHaveProperty("data")
            expect(data.data.length).toEqual(0)
        }, 20000)

        it('should return error', async () => {
            await request.get('/api/v1/characters/1000/height/dsc/all').expect(400)
            await request.get('/api/v1/characters/1000/normally/dsc/all').expect(400)
        }, 30000)

        it('should sort well error', async () => {
            const {body: data} = await request.get('/api/v1/characters/6/height/dsc/all').expect(200)
            expect(data).toHaveProperty("data")
            let pass = true 
            for (let i = 0; i < data.data.length; i++) {
                const ele = data.data[i];
                if(i < data.data.length - 2){
                    if(ele.height < data.data[i + 1].height){
                        pass = false
                    }
                }
            }
            expect(pass).toEqual(true)
        }, 20000)


    })

})