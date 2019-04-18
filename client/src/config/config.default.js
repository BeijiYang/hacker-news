const config = {
	proxyServer:
    process.env.REACT_STATIC_ENV === 'production'
    	? 'xxx'
    	: 'http://localhost:3001',
}

export default config