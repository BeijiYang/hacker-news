import React from 'react'
import GridContainer from './GridContainer'
import Grid from './Grid'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
// import 'jsdom-global/register'

Enzyme.configure({ adapter: new Adapter() })

describe('<Grid />', () => {
	it('Test click event', () => {
		// const mockCallBack = jest.fn()
		// const t = shallow((<Grid onClick={mockCallBack} />))
		// t.find('.grid-wrap').simulate('click')
		// expect(mockCallBack.mock.calls.length).toEqual(1)
	})
})