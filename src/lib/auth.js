import PocketBase from '$lib/pb.js';

if (typeof document !== 'undefined') {
	if (window.console && window.console.log) {
		console.log(
			'%cWARNING: Please do not type random code here. This could result in inrepairable damage to your account!',
			'font-size: 18px; color: red; font-weight: bold;'
		);
	}

	const pb = new PocketBase();

	if (window.location.pathname !== '/') {
		if (!pb.authStore.isValid) {
			document.location.href = '/';
		} else {
			console.log(`[Snacker] Authenicated`);
		}
	} else {
		if (pb.authStore.isValid) {
			console.log(`[Snacker] Authenicated, invalid location.`);
			document.location.href = '/app';
		}
	}
}