import pool from '../db.js';

// --- GRUPOS ---
export const getGrupos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT group_code, group_name FROM article_groups');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createGrupo = async (req, res) => {
  try {
    const { group_code, group_name } = req.body;
    if (!group_code || !group_name) return res.status(400).json({ error: 'Faltan campos requeridos' });
    await pool.query('INSERT INTO article_groups (group_code, group_name) VALUES (?, ?)', [group_code, group_name]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_code, group_name } = req.body;
    if (!group_code || !group_name) return res.status(400).json({ error: 'Faltan campos requeridos' });
    await pool.query('UPDATE article_groups SET group_code=?, group_name=? WHERE group_code=?', [group_code, group_name, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM article_groups WHERE group_code=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- MEDIDAS ---
export const getMedidas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT measure_code, measure_name FROM article_measures');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMedida = async (req, res) => {
  try {
    const { measure_code, measure_name } = req.body;
    if (!measure_code || !measure_name) return res.status(400).json({ error: 'Faltan campos requeridos' });
    await pool.query('INSERT INTO article_measures (measure_code, measure_name) VALUES (?, ?)', [measure_code, measure_name]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const { measure_code, measure_name } = req.body;
    if (!measure_code || !measure_name) return res.status(400).json({ error: 'Faltan campos requeridos' });
    await pool.query('UPDATE article_measures SET measure_code=?, measure_name=? WHERE measure_code=?', [measure_code, measure_name, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMedida = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM article_measures WHERE measure_code=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- UNIDADES ---
export const getUnidades = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT unit_code, unit_name FROM article_units');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUnidad = async (req, res) => {
  try {
    const { unit_code, unit_name } = req.body;
    if (!unit_code || !unit_name) return res.status(400).json({ error: 'Faltan campos requeridos' });
    await pool.query('INSERT INTO article_units (unit_code, unit_name) VALUES (?, ?)', [unit_code, unit_name]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUnidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_code, unit_name } = req.body;
    if (!unit_code || !unit_name) return res.status(400).json({ error: 'Faltan campos requeridos' });
    await pool.query('UPDATE article_units SET unit_code=?, unit_name=? WHERE unit_code=?', [unit_code, unit_name, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUnidad = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM article_units WHERE unit_code=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
