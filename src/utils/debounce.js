export const debounce = function (func, wait, immediate) {
	let timeout, result

	return function () {
		let context = this
		let args = arguments

		if (timeout) clearTimeout(timeout)
		if (immediate) {
			let callNow = !timeout
			timeout = setTimeout(function () {
				timeout = null
			}, wait)
			if (callNow) result = func.apply(context, args)
		}
		else {
			timeout = setTimeout(function () {
				func.apply(context, args)
			}, wait)
		}
		return result
	}
}