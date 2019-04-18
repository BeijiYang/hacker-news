import React from 'react'
import PropTypes from 'prop-types'
import '../styles/grid.css'

const Grid = ({ title, by, score, url, text, handleClick }) => (
	<div className="grid-wrap" onClick={handleClick}>
		<div className="grid-score">
			<div className="grid-triangle"></div>
			<div className="grid-score-number">{score}</div>
			<a href={url} className="grid-url">GO</a>
		</div>
		<div className="grid-content">
			<div className="grid-title"><p>{title}</p></div>
			<div className="grid-by"><p>By {by}</p> </div>
			<div className="grid-text"><p>{text}</p> </div>
		</div>
	</div>
)

Grid.propTypes = {
	handleClick: PropTypes.func,
	title: PropTypes.string,
	by: PropTypes.string,
	score: PropTypes.number,
	url: PropTypes.string,
	text: PropTypes.string,
}

export default Grid
