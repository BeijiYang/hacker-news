import React from 'react'
import '../styles/grid.css'

const Grid = () => (
	<div className="grid-wrap">
		<div className="grid-score">
			<div className="grid-triangle"></div>
			<div className="grid-score-number">score</div>
			<a href="" className="grid-url">GO</a>
		</div>
		<div className="grid-content">
			<div className="grid-title"><p>title</p></div>
			<div className="grid-by"><p>By auther</p> </div>
			<div className="grid-text"><p>text</p> </div>
		</div>
	</div>
)

export default Grid
