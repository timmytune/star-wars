import 'dotenv/config'
import { commentService, } from "../../src/services/comments";
import { Comment } from "../../src/models/comment";


describe('coment service testing', () => {
    beforeAll(async () => {
        //await sequelize.sync({});
        await Comment.sync()
        await Comment.bulkCreate([
            {film_id: 1, body: '1test', ip_address: "127.0.0.1"},
            {film_id: 1, body: '2test', ip_address: "127.0.0.1"},
            {film_id: 1, body: '3test', ip_address: "127.0.0.1"},
        ])
    })

    afterAll(async () => {

        await Comment.destroy({
            where: {},
            truncate: true
          })
        //await sequelize.close()
        
    })

    it('check if our model works fine should return 3 or more comments', async () => {

        let comment = await commentService.createComment({film_id: 2, body: "4test", ip_address: "127.0.0.1"})
        expect(comment).toHaveProperty("id")

        let ret = await Comment.count({})
        expect(ret).toBeGreaterThan(2)

        let count = await commentService.countComments({where: {film_id: 1}})
        expect(count).toEqual(3)


    })

    it('check countComments should return 3', async () => {
        let count = await commentService.countComments({where: {film_id: 0}})
        expect(count).toEqual(0)
    })



    it('check createComment', async () => {
        let comment = await commentService.getComment(2)
        expect(comment).toHaveProperty("id")

        comment = await commentService.getComment(200)
        expect(comment).not.toHaveProperty("id")

    })

    it('get comments', async () => {
        let comments = await commentService.getComments({where: {film_id: 1}})
        expect(comments).not.toBe(Error)

        if(comments instanceof Array) expect(comments.length).toBeGreaterThan(2)

    })
})