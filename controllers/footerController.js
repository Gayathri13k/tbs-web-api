const pool = require('../config/db')

const GetAllFooter = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.footer');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { GetAllFooter }