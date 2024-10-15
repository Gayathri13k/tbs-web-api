const pool = require('../config/db')

const getRoute = async (req, res)=> {
    try {
        const query = `SELECT * FROM public."Travel_Related_Policies"`
        const result = await pool.query(query)
        res.status(201).json(result.rows)
    } catch (error) {
        console.error(error);
        res.status(201).json({message: 'INTERNAL SERVER ERROR'})
    }
}

module.exports = { getRoute }
