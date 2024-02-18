import { onMount } from "svelte";

const BASEURL = 'https://snacker.db.orae.one';

!(function (e, t) {
	'object' == typeof exports && 'undefined' != typeof module
		? (module.exports = t())
		: 'function' == typeof define && define.amd
			? define(t)
			: ((e =
					'undefined' != typeof globalThis
						? globalThis
						: e || self).PocketBase = t());
})(this, function () {
	'use strict';
	class ClientResponseError extends Error {
		constructor(e) {
			super('ClientResponseError'),
				(this.url = ''),
				(this.status = 0),
				(this.response = {}),
				(this.isAbort = !1),
				(this.originalError = null),
				Object.setPrototypeOf(this, ClientResponseError.prototype),
				null !== e &&
					'object' == typeof e &&
					((this.url = 'string' == typeof e.url ? e.url : ''),
					(this.status = 'number' == typeof e.status ? e.status : 0),
					(this.isAbort = !!e.isAbort),
					(this.originalError = e.originalError),
					null !== e.response && 'object' == typeof e.response
						? (this.response = e.response)
						: null !== e.data && 'object' == typeof e.data
							? (this.response = e.data)
							: (this.response = {})),
				this.originalError ||
					e instanceof ClientResponseError ||
					(this.originalError = e),
				'undefined' != typeof DOMException &&
					e instanceof DOMException &&
					(this.isAbort = !0),
				(this.name = 'ClientResponseError ' + this.status),
				(this.message = this.response?.message),
				this.message ||
					(this.isAbort
						? (this.message =
								'The request was autocancelled.')
						: this.originalError?.cause?.message?.includes('ECONNREFUSED ::1')
							? (this.message =
									'Failed to connect to the backend server.')
							: (this.message =
									'Something went wrong while processing your request.'));
		}
		get data() {
			return this.response;
		}
		toJSON() {
			return {
				...this
			};
		}
	}
	const e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

	function cookieSerialize(t, s, i) {
		const n = Object.assign({}, i || {}),
			r = n.encode || defaultEncode;
		if (!e.test(t)) throw new TypeError('argument name is invalid');
		const o = r(s);
		if (o && !e.test(o)) throw new TypeError('argument val is invalid');
		let a = t + '=' + o;
		if (null != n.maxAge) {
			const e = n.maxAge - 0;
			if (isNaN(e) || !isFinite(e))
				throw new TypeError('option maxAge is invalid');
			a += '; Max-Age=' + Math.floor(e);
		}
		if (n.domain) {
			if (!e.test(n.domain)) throw new TypeError('option domain is invalid');
			a += '; Domain=' + n.domain;
		}
		if (n.path) {
			if (!e.test(n.path)) throw new TypeError('option path is invalid');
			a += '; Path=' + n.path;
		}
		if (n.expires) {
			if (
				!(function isDate(e) {
					return (
						'[object Date]' === Object.prototype.toString.call(e) ||
						e instanceof Date
					);
				})(n.expires) ||
				isNaN(n.expires.valueOf())
			)
				throw new TypeError('option expires is invalid');
			a += '; Expires=' + n.expires.toUTCString();
		}
		if (
			(n.httpOnly && (a += '; HttpOnly'),
			n.secure && (a += '; Secure'),
			n.priority)
		) {
			switch (
				'string' == typeof n.priority ? n.priority.toLowerCase() : n.priority
			) {
				case 'low':
					a += '; Priority=Low';
					break;
				case 'medium':
					a += '; Priority=Medium';
					break;
				case 'high':
					a += '; Priority=High';
					break;
				default:
					throw new TypeError('option priority is invalid');
			}
		}
		if (n.sameSite) {
			switch (
				'string' == typeof n.sameSite ? n.sameSite.toLowerCase() : n.sameSite
			) {
				case !0:
					a += '; SameSite=Strict';
					break;
				case 'lax':
					a += '; SameSite=Lax';
					break;
				case 'strict':
					a += '; SameSite=Strict';
					break;
				case 'none':
					a += '; SameSite=None';
					break;
				default:
					throw new TypeError('option sameSite is invalid');
			}
		}
		return a;
	}

	function defaultDecode(e) {
		return -1 !== e.indexOf('%') ? decodeURIComponent(e) : e;
	}

	function defaultEncode(e) {
		return encodeURIComponent(e);
	}
	let t;

	function getTokenPayload(e) {
		if (e)
			try {
				const s = decodeURIComponent(
					t(e.split('.')[1])
						.split('')
						.map(function (e) {
							return '%' + ('00' + e.charCodeAt(0).toString(16)).slice(-2);
						})
						.join('')
				);
				return JSON.parse(s) || {};
			} catch (e) {}
		return {};
	}

	function isTokenExpired(e, t = 0) {
		let s = getTokenPayload(e);
		return !(
			Object.keys(s).length > 0 &&
			(!s.exp || s.exp - t > Date.now() / 1e3)
		);
	}
	t =
		'function' == typeof atob
			? atob
			: (e) => {
					let t = String(e).replace(/=+$/, '');
					if (t.length % 4 == 1)
						throw new Error(
							"'atob' failed: The string to be decoded is not correctly encoded."
						);
					for (
						var s, i, n = 0, r = 0, o = '';
						(i = t.charAt(r++));
						~i && ((s = n % 4 ? 64 * s + i : i), n++ % 4)
							? (o += String.fromCharCode(255 & (s >> ((-2 * n) & 6))))
							: 0
					)
						i =
							'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.indexOf(
								i
							);
					return o;
				};
	const s = 'pb_auth';
	class BaseAuthStore {
		constructor() {
			(this.baseToken = ''),
				(this.baseModel = null),
				(this._onChangeCallbacks = []);
		}
		get token() {
			return this.baseToken;
		}
		get model() {
			return this.baseModel;
		}
		get isValid() {
			return !isTokenExpired(this.token);
		}
		get isAdmin() {
			return 'admin' === getTokenPayload(this.token).type;
		}
		get isAuthRecord() {
			return 'authRecord' === getTokenPayload(this.token).type;
		}
		save(e, t) {
			(this.baseToken = e || ''),
				(this.baseModel = t || null),
				this.triggerChange();
		}
		clear() {
			(this.baseToken = ''), (this.baseModel = null), this.triggerChange();
		}
		loadFromCookie(e, t = s) {
			const i =
				(function cookieParse(e, t) {
					const s = {};
					if ('string' != typeof e) return s;
					const i = Object.assign({}, t || {}).decode || defaultDecode;
					let n = 0;
					for (; n < e.length; ) {
						const t = e.indexOf('=', n);
						if (-1 === t) break;
						let r = e.indexOf(';', n);
						if (-1 === r) r = e.length;
						else if (r < t) {
							n = e.lastIndexOf(';', t - 1) + 1;
							continue;
						}
						const o = e.slice(n, t).trim();
						if (void 0 === s[o]) {
							let n = e.slice(t + 1, r).trim();
							34 === n.charCodeAt(0) && (n = n.slice(1, -1));
							try {
								s[o] = i(n);
							} catch (e) {
								s[o] = n;
							}
						}
						n = r + 1;
					}
					return s;
				})(e || '')[t] || '';
			let n = {};
			try {
				(n = JSON.parse(i)),
					(null === typeof n || 'object' != typeof n || Array.isArray(n)) &&
						(n = {});
			} catch (e) {}
			this.save(n.token || '', n.model || null);
		}
		exportToCookie(e, t = s) {
			const i = {
					secure: !0,
					sameSite: !0,
					httpOnly: !0,
					path: '/'
				},
				n = getTokenPayload(this.token);
			(i.expires = n?.exp ? new Date(1e3 * n.exp) : new Date('1970-01-01')),
				(e = Object.assign({}, i, e));
			const r = {
				token: this.token,
				model: this.model ? JSON.parse(JSON.stringify(this.model)) : null
			};
			let o = cookieSerialize(t, JSON.stringify(r), e);
			const a = 'undefined' != typeof Blob ? new Blob([o]).size : o.length;
			if (r.model && a > 4096) {
				r.model = {
					id: r?.model?.id,
					email: r?.model?.email
				};
				const s = ['collectionId', 'username', 'verified'];
				for (const e in this.model)
					s.includes(e) && (r.model[e] = this.model[e]);
				o = cookieSerialize(t, JSON.stringify(r), e);
			}
			return o;
		}
		onChange(e, t = !1) {
			return (
				this._onChangeCallbacks.push(e),
				t && e(this.token, this.model),
				() => {
					for (let t = this._onChangeCallbacks.length - 1; t >= 0; t--)
						if (this._onChangeCallbacks[t] == e)
							return (
								delete this._onChangeCallbacks[t],
								void this._onChangeCallbacks.splice(t, 1)
							);
				}
			);
		}
		triggerChange() {
			for (const e of this._onChangeCallbacks) e && e(this.token, this.model);
		}
	}
	class LocalAuthStore extends BaseAuthStore {
		constructor(e = 'pocketbase_auth') {
			super(),
				(this.storageFallback = {}),
				(this.storageKey = e),
				this._bindStorageEvent();
		}
		get token() {
			return (this._storageGet(this.storageKey) || {}).token || '';
		}
		get model() {
			return (this._storageGet(this.storageKey) || {}).model || null;
		}
		save(e, t) {
			this._storageSet(this.storageKey, {
				token: e,
				model: t
			}),
				super.save(e, t);
		}
		clear() {
			this._storageRemove(this.storageKey), super.clear();
		}
		_storageGet(e) {
			if ('undefined' != typeof window && window?.localStorage) {
				const t = window.localStorage.getItem(e) || '';
				try {
					return JSON.parse(t);
				} catch (e) {
					return t;
				}
			}
			return this.storageFallback[e];
		}
		_storageSet(e, t) {
			if ('undefined' != typeof window && window?.localStorage) {
				let s = t;
				'string' != typeof t && (s = JSON.stringify(t)),
					window.localStorage.setItem(e, s);
			} else this.storageFallback[e] = t;
		}
		_storageRemove(e) {
			'undefined' != typeof window &&
				window?.localStorage &&
				window.localStorage?.removeItem(e),
				delete this.storageFallback[e];
		}
		_bindStorageEvent() {
			'undefined' != typeof window &&
				window?.localStorage &&
				window.addEventListener &&
				window.addEventListener('storage', (e) => {
					if (e.key != this.storageKey) return;
					const t = this._storageGet(this.storageKey) || {};
					super.save(t.token || '', t.model || null);
				});
		}
	}
	class BaseService {
		constructor(e) {
			this.client = e;
		}
	}
	class SettingsService extends BaseService {
		getAll(e) {
			return (
				(e = Object.assign(
					{
						method: 'GET'
					},
					e
				)),
				this.client.send('/api/settings', e)
			);
		}
		update(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'PATCH',
						body: e
					},
					t
				)),
				this.client.send('/api/settings', t)
			);
		}
		testS3(e = 'storage', t) {
			return (
				(t = Object.assign(
					{
						method: 'POST',
						body: {
							filesystem: e
						}
					},
					t
				)),
				this.client.send('/api/settings/test/s3', t).then(() => !0)
			);
		}
		testEmail(e, t, s) {
			return (
				(s = Object.assign(
					{
						method: 'POST',
						body: {
							email: e,
							template: t
						}
					},
					s
				)),
				this.client.send('/api/settings/test/email', s).then(() => !0)
			);
		}
		generateAppleClientSecret(e, t, s, i, n, r) {
			return (
				(r = Object.assign(
					{
						method: 'POST',
						body: {
							clientId: e,
							teamId: t,
							keyId: s,
							privateKey: i,
							duration: n
						}
					},
					r
				)),
				this.client.send('/api/settings/apple/generate-client-secret', r)
			);
		}
	}
	class CrudService extends BaseService {
		decode(e) {
			return e;
		}
		getFullList(e, t) {
			if ('number' == typeof e) return this._getFullList(e, t);
			let s = 500;
			return (
				(t = Object.assign({}, e, t)).batch && ((s = t.batch), delete t.batch),
				this._getFullList(s, t)
			);
		}
		getList(e = 1, t = 30, s) {
			return (
				((s = Object.assign(
					{
						method: 'GET'
					},
					s
				)).query = Object.assign(
					{
						page: e,
						perPage: t
					},
					s.query
				)),
				this.client
					.send(this.baseCrudPath, s)
					.then(
						(e) => ((e.items = e.items?.map((e) => this.decode(e)) || []), e)
					)
			);
		}
		getFirstListItem(e, t) {
			return (
				((t = Object.assign(
					{
						requestKey: 'one_by_filter_' + this.baseCrudPath + '_' + e
					},
					t
				)).query = Object.assign(
					{
						filter: e,
						skipTotal: 1
					},
					t.query
				)),
				this.getList(1, 1, t).then((e) => {
					if (!e?.items?.length)
						throw new ClientResponseError({
							status: 404,
							data: {
								code: 404,
								message: "The requested resource wasn't found.",
								data: {}
							}
						});
					return e.items[0];
				})
			);
		}
		getOne(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'GET'
					},
					t
				)),
				this.client
					.send(this.baseCrudPath + '/' + encodeURIComponent(e), t)
					.then((e) => this.decode(e))
			);
		}
		create(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'POST',
						body: e
					},
					t
				)),
				this.client.send(this.baseCrudPath, t).then((e) => this.decode(e))
			);
		}
		update(e, t, s) {
			return (
				(s = Object.assign(
					{
						method: 'PATCH',
						body: t
					},
					s
				)),
				this.client
					.send(this.baseCrudPath + '/' + encodeURIComponent(e), s)
					.then((e) => this.decode(e))
			);
		}
		delete(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'DELETE'
					},
					t
				)),
				this.client
					.send(this.baseCrudPath + '/' + encodeURIComponent(e), t)
					.then(() => !0)
			);
		}
		_getFullList(e = 500, t) {
			(t = t || {}).query = Object.assign(
				{
					skipTotal: 1
				},
				t.query
			);
			let s = [],
				request = async (i) =>
					this.getList(i, e || 500, t).then((e) => {
						const t = e.items;
						return (
							(s = s.concat(t)), t.length == e.perPage ? request(i + 1) : s
						);
					});
			return request(1);
		}
	}

	function normalizeLegacyOptionsArgs(e, t, s, i) {
		const n = void 0 !== i;
		return n || void 0 !== s
			? n
				? (console.warn(e),
					(t.body = Object.assign({}, t.body, s)),
					(t.query = Object.assign({}, t.query, i)),
					t)
				: Object.assign(t, s)
			: t;
	}

	function resetAutoRefresh(e) {
		e._resetAutoRefresh?.();
	}
	class AdminService extends CrudService {
		get baseCrudPath() {
			return '/api/admins';
		}
		update(e, t, s) {
			return super
				.update(e, t, s)
				.then(
					(e) => (
						this.client.authStore.model?.id === e.id &&
							void 0 === this.client.authStore.model?.collectionId &&
							this.client.authStore.save(this.client.authStore.token, e),
						e
					)
				);
		}
		delete(e, t) {
			return super
				.delete(e, t)
				.then(
					(t) => (
						t &&
							this.client.authStore.model?.id === e &&
							void 0 === this.client.authStore.model?.collectionId &&
							this.client.authStore.clear(),
						t
					)
				);
		}
		authResponse(e) {
			const t = this.decode(e?.admin || {});
			return (
				e?.token && e?.admin && this.client.authStore.save(e.token, t),
				Object.assign({}, e, {
					token: e?.token || '',
					admin: t
				})
			);
		}
		async authWithPassword(e, t, s, i) {
			let n = {
				method: 'POST',
				body: {
					identity: e,
					password: t
				}
			};
			n = normalizeLegacyOptionsArgs(
				'This form of authWithPassword(email, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(email, pass, options?).',
				n,
				s,
				i
			);
			const r = n.autoRefreshThreshold;
			delete n.autoRefreshThreshold,
				n.autoRefresh || resetAutoRefresh(this.client);
			let o = await this.client.send(
				this.baseCrudPath + '/auth-with-password',
				n
			);
			return (
				(o = this.authResponse(o)),
				r &&
					(function registerAutoRefresh(e, t, s, i) {
						resetAutoRefresh(e);
						const n = e.beforeSend,
							r = e.authStore.model,
							o = e.authStore.onChange((t, s) => {
								(!t ||
									s?.id != r?.id ||
									((s?.collectionId || r?.collectionId) &&
										s?.collectionId != r?.collectionId)) &&
									resetAutoRefresh(e);
							});
						(e._resetAutoRefresh = function () {
							o(), (e.beforeSend = n), delete e._resetAutoRefresh;
						}),
							(e.beforeSend = async (r, o) => {
								const a = e.authStore.token;
								if (o.query?.autoRefresh)
									return n
										? n(r, o)
										: {
												url: r,
												sendOptions: o
											};
								let c = e.authStore.isValid;
								if (c && isTokenExpired(e.authStore.token, t))
									try {
										await s();
									} catch (e) {
										c = !1;
									}
								c || (await i());
								const l = o.headers || {};
								for (let t in l)
									if (
										'authorization' == t.toLowerCase() &&
										a == l[t] &&
										e.authStore.token
									) {
										l[t] = e.authStore.token;
										break;
									}
								return (
									(o.headers = l),
									n
										? n(r, o)
										: {
												url: r,
												sendOptions: o
											}
								);
							});
					})(
						this.client,
						r,
						() =>
							this.authRefresh({
								autoRefresh: !0
							}),
						() =>
							this.authWithPassword(
								e,
								t,
								Object.assign(
									{
										autoRefresh: !0
									},
									n
								)
							)
					),
				o
			);
		}
		authRefresh(e, t) {
			let s = {
				method: 'POST'
			};
			return (
				(s = normalizeLegacyOptionsArgs(
					'This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).',
					s,
					e,
					t
				)),
				this.client
					.send(this.baseCrudPath + '/auth-refresh', s)
					.then(this.authResponse.bind(this))
			);
		}
		requestPasswordReset(e, t, s) {
			let i = {
				method: 'POST',
				body: {
					email: e
				}
			};
			return (
				(i = normalizeLegacyOptionsArgs(
					'This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).',
					i,
					t,
					s
				)),
				this.client
					.send(this.baseCrudPath + '/request-password-reset', i)
					.then(() => !0)
			);
		}
		confirmPasswordReset(e, t, s, i, n) {
			let r = {
				method: 'POST',
				body: {
					token: e,
					password: t,
					passwordConfirm: s
				}
			};
			return (
				(r = normalizeLegacyOptionsArgs(
					'This form of confirmPasswordReset(resetToken, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(resetToken, password, passwordConfirm, options?).',
					r,
					i,
					n
				)),
				this.client
					.send(this.baseCrudPath + '/confirm-password-reset', r)
					.then(() => !0)
			);
		}
	}
	class RealtimeService extends BaseService {
		constructor() {
			super(...arguments),
				(this.clientId = ''),
				(this.eventSource = null),
				(this.subscriptions = {}),
				(this.lastSentTopics = []),
				(this.maxConnectTimeout = 15e3),
				(this.reconnectAttempts = 0),
				(this.maxReconnectAttempts = 1 / 0),
				(this.predefinedReconnectIntervals = [
					200, 300, 500, 1e3, 1200, 1500, 2e3
				]),
				(this.pendingConnects = []);
		}
		get isConnected() {
			return (
				!!this.eventSource && !!this.clientId && !this.pendingConnects.length
			);
		}
		async subscribe(e, t) {
			if (!e) throw new Error('topic must be set.');
			const listener = function (e) {
				const s = e;
				let i;
				try {
					i = JSON.parse(s?.data);
				} catch {}
				t(i || {});
			};
			return (
				this.subscriptions[e] || (this.subscriptions[e] = []),
				this.subscriptions[e].push(listener),
				this.isConnected
					? 1 === this.subscriptions[e].length
						? await this.submitSubscriptions()
						: this.eventSource?.addEventListener(e, listener)
					: await this.connect(),
				async () => this.unsubscribeByTopicAndListener(e, listener)
			);
		}
		async unsubscribe(e) {
			if (this.hasSubscriptionListeners(e)) {
				if (e) {
					for (let t of this.subscriptions[e])
						this.eventSource?.removeEventListener(e, t);
					delete this.subscriptions[e];
				} else this.subscriptions = {};
				this.hasSubscriptionListeners()
					? this.hasSubscriptionListeners(e) ||
						(await this.submitSubscriptions())
					: this.disconnect();
			}
		}
		async unsubscribeByPrefix(e) {
			let t = !1;
			for (let s in this.subscriptions)
				if (s.startsWith(e)) {
					t = !0;
					for (let e of this.subscriptions[s])
						this.eventSource?.removeEventListener(s, e);
					delete this.subscriptions[s];
				}
			t &&
				(this.hasSubscriptionListeners()
					? await this.submitSubscriptions()
					: this.disconnect());
		}
		async unsubscribeByTopicAndListener(e, t) {
			if (
				!Array.isArray(this.subscriptions[e]) ||
				!this.subscriptions[e].length
			)
				return;
			let s = !1;
			for (let i = this.subscriptions[e].length - 1; i >= 0; i--)
				this.subscriptions[e][i] === t &&
					((s = !0),
					delete this.subscriptions[e][i],
					this.subscriptions[e].splice(i, 1),
					this.eventSource?.removeEventListener(e, t));
			s &&
				(this.subscriptions[e].length || delete this.subscriptions[e],
				this.hasSubscriptionListeners()
					? this.hasSubscriptionListeners(e) ||
						(await this.submitSubscriptions())
					: this.disconnect());
		}
		hasSubscriptionListeners(e) {
			if (((this.subscriptions = this.subscriptions || {}), e))
				return !!this.subscriptions[e]?.length;
			for (let e in this.subscriptions)
				if (this.subscriptions[e]?.length) return !0;
			return !1;
		}
		async submitSubscriptions() {
			if (this.clientId)
				return (
					this.addAllSubscriptionListeners(),
					(this.lastSentTopics = this.getNonEmptySubscriptionTopics()),
					this.client
						.send('/api/realtime', {
							method: 'POST',
							body: {
								clientId: this.clientId,
								subscriptions: this.lastSentTopics
							},
							requestKey: this.getSubscriptionsCancelKey()
						})
						.catch((e) => {
							if (!e?.isAbort) throw e;
						})
				);
		}
		getSubscriptionsCancelKey() {
			return 'realtime_' + this.clientId;
		}
		getNonEmptySubscriptionTopics() {
			const e = [];
			for (let t in this.subscriptions)
				this.subscriptions[t].length && e.push(t);
			return e;
		}
		addAllSubscriptionListeners() {
			if (this.eventSource) {
				this.removeAllSubscriptionListeners();
				for (let e in this.subscriptions)
					for (let t of this.subscriptions[e])
						this.eventSource.addEventListener(e, t);
			}
		}
		removeAllSubscriptionListeners() {
			if (this.eventSource)
				for (let e in this.subscriptions)
					for (let t of this.subscriptions[e])
						this.eventSource.removeEventListener(e, t);
		}
		async connect() {
			if (!(this.reconnectAttempts > 0))
				return new Promise((e, t) => {
					this.pendingConnects.push({
						resolve: e,
						reject: t
					}),
						this.pendingConnects.length > 1 || this.initConnect();
				});
		}
		initConnect() {
			this.disconnect(!0),
				clearTimeout(this.connectTimeoutId),
				(this.connectTimeoutId = setTimeout(() => {
					this.connectErrorHandler(
						new Error('EventSource connect took too long.')
					);
				}, this.maxConnectTimeout)),
				(this.eventSource = new EventSource(
					this.client.buildUrl('/api/realtime')
				)),
				(this.eventSource.onerror = (e) => {
					this.connectErrorHandler(
						new Error('Failed to establish realtime connection.')
					);
				}),
				this.eventSource.addEventListener('PB_CONNECT', (e) => {
					const t = e;
					(this.clientId = t?.lastEventId),
						this.submitSubscriptions()
							.then(async () => {
								let e = 3;
								for (; this.hasUnsentSubscriptions() && e > 0; )
									e--, await this.submitSubscriptions();
							})
							.then(() => {
								for (let e of this.pendingConnects) e.resolve();
								(this.pendingConnects = []),
									(this.reconnectAttempts = 0),
									clearTimeout(this.reconnectTimeoutId),
									clearTimeout(this.connectTimeoutId);
							})
							.catch((e) => {
								(this.clientId = ''), this.connectErrorHandler(e);
							});
				});
		}
		hasUnsentSubscriptions() {
			const e = this.getNonEmptySubscriptionTopics();
			if (e.length != this.lastSentTopics.length) return !0;
			for (const t of e) if (!this.lastSentTopics.includes(t)) return !0;
			return !1;
		}
		connectErrorHandler(e) {
			if (
				(clearTimeout(this.connectTimeoutId),
				clearTimeout(this.reconnectTimeoutId),
				(!this.clientId && !this.reconnectAttempts) ||
					this.reconnectAttempts > this.maxReconnectAttempts)
			) {
				for (let t of this.pendingConnects)
					t.reject(new ClientResponseError(e));
				return (this.pendingConnects = []), void this.disconnect();
			}
			this.disconnect(!0);
			const t =
				this.predefinedReconnectIntervals[this.reconnectAttempts] ||
				this.predefinedReconnectIntervals[
					this.predefinedReconnectIntervals.length - 1
				];
			this.reconnectAttempts++,
				(this.reconnectTimeoutId = setTimeout(() => {
					this.initConnect();
				}, t));
		}
		disconnect(e = !1) {
			if (
				(clearTimeout(this.connectTimeoutId),
				clearTimeout(this.reconnectTimeoutId),
				this.removeAllSubscriptionListeners(),
				this.client.cancelRequest(this.getSubscriptionsCancelKey()),
				this.eventSource?.close(),
				(this.eventSource = null),
				(this.clientId = ''),
				!e)
			) {
				this.reconnectAttempts = 0;
				for (let e of this.pendingConnects) e.resolve();
				this.pendingConnects = [];
			}
		}
	}
	class RecordService extends CrudService {
		constructor(e, t) {
			super(e), (this.collectionIdOrName = t);
		}
		get baseCrudPath() {
			return this.baseCollectionPath + '/records';
		}
		get baseCollectionPath() {
			return '/api/collections/' + encodeURIComponent(this.collectionIdOrName);
		}
		async subscribeOne(e, t) {
			return (
				console.warn(
					'PocketBase: subscribeOne(recordId, callback) is deprecated. Please replace it with subscribe(recordId, callback).'
				),
				this.client.realtime.subscribe(this.collectionIdOrName + '/' + e, t)
			);
		}
		async subscribe(e, t) {
			if ('function' == typeof e)
				return (
					console.warn(
						"PocketBase: subscribe(callback) is deprecated. Please replace it with subscribe('*', callback)."
					),
					this.client.realtime.subscribe(this.collectionIdOrName, e)
				);
			if (!t) throw new Error('Missing subscription callback.');
			if ('' === e) throw new Error('Missing topic.');
			let s = this.collectionIdOrName;
			return '*' !== e && (s += '/' + e), this.client.realtime.subscribe(s, t);
		}
		async unsubscribe(e) {
			return '*' === e
				? this.client.realtime.unsubscribe(this.collectionIdOrName)
				: e
					? this.client.realtime.unsubscribe(this.collectionIdOrName + '/' + e)
					: this.client.realtime.unsubscribeByPrefix(this.collectionIdOrName);
		}
		getFullList(e, t) {
			if ('number' == typeof e) return super.getFullList(e, t);
			const s = Object.assign({}, e, t);
			return super.getFullList(s);
		}
		getList(e = 1, t = 30, s) {
			return super.getList(e, t, s);
		}
		getFirstListItem(e, t) {
			return super.getFirstListItem(e, t);
		}
		getOne(e, t) {
			return super.getOne(e, t);
		}
		create(e, t) {
			return super.create(e, t);
		}
		update(e, t, s) {
			return super
				.update(e, t, s)
				.then(
					(e) => (
						this.client.authStore.model?.id !== e?.id ||
							(this.client.authStore.model?.collectionId !==
								this.collectionIdOrName &&
								this.client.authStore.model?.collectionName !==
									this.collectionIdOrName) ||
							this.client.authStore.save(this.client.authStore.token, e),
						e
					)
				);
		}
		delete(e, t) {
			return super
				.delete(e, t)
				.then(
					(t) => (
						!t ||
							this.client.authStore.model?.id !== e ||
							(this.client.authStore.model?.collectionId !==
								this.collectionIdOrName &&
								this.client.authStore.model?.collectionName !==
									this.collectionIdOrName) ||
							this.client.authStore.clear(),
						t
					)
				);
		}
		authResponse(e) {
			const t = this.decode(e?.record || {});
			return (
				this.client.authStore.save(e?.token, t),
				Object.assign({}, e, {
					token: e?.token || '',
					record: t
				})
			);
		}
		listAuthMethods(e) {
			return (
				(e = Object.assign(
					{
						method: 'GET'
					},
					e
				)),
				this.client
					.send(this.baseCollectionPath + '/auth-methods', e)
					.then((e) =>
						Object.assign({}, e, {
							usernamePassword: !!e?.usernamePassword,
							emailPassword: !!e?.emailPassword,
							authProviders: Array.isArray(e?.authProviders)
								? e?.authProviders
								: []
						})
					)
			);
		}
		authWithPassword(e, t, s, i) {
			let n = {
				method: 'POST',
				body: {
					identity: e,
					password: t
				}
			};
			return (
				(n = normalizeLegacyOptionsArgs(
					'This form of authWithPassword(usernameOrEmail, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(usernameOrEmail, pass, options?).',
					n,
					s,
					i
				)),
				this.client
					.send(this.baseCollectionPath + '/auth-with-password', n)
					.then((e) => this.authResponse(e))
			);
		}
		authWithOAuth2Code(e, t, s, i, n, r, o) {
			let a = {
				method: 'POST',
				body: {
					provider: e,
					code: t,
					codeVerifier: s,
					redirectUrl: i,
					createData: n
				}
			};
			return (
				(a = normalizeLegacyOptionsArgs(
					'This form of authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, body?, query?) is deprecated. Consider replacing it with authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, options?).',
					a,
					r,
					o
				)),
				this.client
					.send(this.baseCollectionPath + '/auth-with-oauth2', a)
					.then((e) => this.authResponse(e))
			);
		}
		async authWithOAuth2(...e) {
			if (e.length > 1 || 'string' == typeof e?.[0])
				return (
					console.warn(
						'PocketBase: This form of authWithOAuth2() is deprecated and may get removed in the future. Please replace with authWithOAuth2Code() OR use the authWithOAuth2() realtime form as shown in https://pocketbase.io/docs/authentication/#oauth2-integration.'
					),
					this.authWithOAuth2Code(
						e?.[0] || '',
						e?.[1] || '',
						e?.[2] || '',
						e?.[3] || '',
						e?.[4] || {},
						e?.[5] || {},
						e?.[6] || {}
					)
				);
			const t = e?.[0] || {},
				s = (await this.listAuthMethods()).authProviders.find(
					(e) => e.name === t.provider
				);
			if (!s)
				throw new ClientResponseError(
					new Error(`Missing or invalid provider "${t.provider}".`)
				);
			const i = this.client.buildUrl('/api/oauth2-redirect'),
				n = new RealtimeService(this.client);
			let r = null;

			function cleanup() {
				r?.close(), n.unsubscribe();
			}
			return (
				t.urlCallback || (r = openBrowserPopup(void 0)),
				new Promise(async (e, o) => {
					try {
						await n.subscribe('@oauth2', async (r) => {
							const a = n.clientId;
							try {
								if (!r.state || a !== r.state)
									throw new Error("State parameters don't match.");
								const n = Object.assign({}, t);
								delete n.provider,
									delete n.scopes,
									delete n.createData,
									delete n.urlCallback;
								const o = await this.authWithOAuth2Code(
									s.name,
									r.code,
									s.codeVerifier,
									i,
									t.createData,
									n
								);
								e(o);
							} catch (e) {
								o(new ClientResponseError(e));
							}
							cleanup();
						});
						const a = {
							state: n.clientId
						};
						t.scopes?.length && (a.scope = t.scopes.join(' '));
						const c = this._replaceQueryParams(s.authUrl + i, a);
						let l =
							t.urlCallback ||
							function (e) {
								r ? (r.location.href = e) : (r = openBrowserPopup(e));
							};
						await l(c);
					} catch (e) {
						cleanup(), o(new ClientResponseError(e));
					}
				})
			);
		}
		authRefresh(e, t) {
			let s = {
				method: 'POST'
			};
			return (
				(s = normalizeLegacyOptionsArgs(
					'This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).',
					s,
					e,
					t
				)),
				this.client
					.send(this.baseCollectionPath + '/auth-refresh', s)
					.then((e) => this.authResponse(e))
			);
		}
		requestPasswordReset(e, t, s) {
			let i = {
				method: 'POST',
				body: {
					email: e
				}
			};
			return (
				(i = normalizeLegacyOptionsArgs(
					'This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).',
					i,
					t,
					s
				)),
				this.client
					.send(this.baseCollectionPath + '/request-password-reset', i)
					.then(() => !0)
			);
		}
		confirmPasswordReset(e, t, s, i, n) {
			let r = {
				method: 'POST',
				body: {
					token: e,
					password: t,
					passwordConfirm: s
				}
			};
			return (
				(r = normalizeLegacyOptionsArgs(
					'This form of confirmPasswordReset(token, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(token, password, passwordConfirm, options?).',
					r,
					i,
					n
				)),
				this.client
					.send(this.baseCollectionPath + '/confirm-password-reset', r)
					.then(() => !0)
			);
		}
		requestVerification(e, t, s) {
			let i = {
				method: 'POST',
				body: {
					email: e
				}
			};
			return (
				(i = normalizeLegacyOptionsArgs(
					'This form of requestVerification(email, body?, query?) is deprecated. Consider replacing it with requestVerification(email, options?).',
					i,
					t,
					s
				)),
				this.client
					.send(this.baseCollectionPath + '/request-verification', i)
					.then(() => !0)
			);
		}
		confirmVerification(e, t, s) {
			let i = {
				method: 'POST',
				body: {
					token: e
				}
			};
			return (
				(i = normalizeLegacyOptionsArgs(
					'This form of confirmVerification(token, body?, query?) is deprecated. Consider replacing it with confirmVerification(token, options?).',
					i,
					t,
					s
				)),
				this.client
					.send(this.baseCollectionPath + '/confirm-verification', i)
					.then(() => !0)
			);
		}
		requestEmailChange(e, t, s) {
			let i = {
				method: 'POST',
				body: {
					newEmail: e
				}
			};
			return (
				(i = normalizeLegacyOptionsArgs(
					'This form of requestEmailChange(newEmail, body?, query?) is deprecated. Consider replacing it with requestEmailChange(newEmail, options?).',
					i,
					t,
					s
				)),
				this.client
					.send(this.baseCollectionPath + '/request-email-change', i)
					.then(() => !0)
			);
		}
		confirmEmailChange(e, t, s, i) {
			let n = {
				method: 'POST',
				body: {
					token: e,
					password: t
				}
			};
			return (
				(n = normalizeLegacyOptionsArgs(
					'This form of confirmEmailChange(token, password, body?, query?) is deprecated. Consider replacing it with confirmEmailChange(token, password, options?).',
					n,
					s,
					i
				)),
				this.client
					.send(this.baseCollectionPath + '/confirm-email-change', n)
					.then(() => !0)
			);
		}
		listExternalAuths(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'GET'
					},
					t
				)),
				this.client.send(
					this.baseCrudPath + '/' + encodeURIComponent(e) + '/external-auths',
					t
				)
			);
		}
		unlinkExternalAuth(e, t, s) {
			return (
				(s = Object.assign(
					{
						method: 'DELETE'
					},
					s
				)),
				this.client
					.send(
						this.baseCrudPath +
							'/' +
							encodeURIComponent(e) +
							'/external-auths/' +
							encodeURIComponent(t),
						s
					)
					.then(() => !0)
			);
		}
		_replaceQueryParams(e, t = {}) {
			let s = e,
				i = '';
			e.indexOf('?') >= 0 &&
				((s = e.substring(0, e.indexOf('?'))),
				(i = e.substring(e.indexOf('?') + 1)));
			const n = {},
				r = i.split('&');
			for (const e of r) {
				if ('' == e) continue;
				const t = e.split('=');
				n[decodeURIComponent(t[0].replace(/\+/g, ' '))] = decodeURIComponent(
					(t[1] || '').replace(/\+/g, ' ')
				);
			}
			for (let e in t)
				t.hasOwnProperty(e) && (null == t[e] ? delete n[e] : (n[e] = t[e]));
			i = '';
			for (let e in n)
				n.hasOwnProperty(e) &&
					('' != i && (i += '&'),
					(i +=
						encodeURIComponent(e.replace(/%20/g, '+')) +
						'=' +
						encodeURIComponent(n[e].replace(/%20/g, '+'))));
			return '' != i ? s + '?' + i : s;
		}
	}

	function openBrowserPopup(e) {
		if ('undefined' == typeof window || !window?.open)
			throw new ClientResponseError(
				new Error(
					'Not in a browser context - please pass a custom urlCallback function.'
				)
			);
		let t = 1024,
			s = 768,
			i = window.innerWidth,
			n = window.innerHeight;
		(t = t > i ? i : t), (s = s > n ? n : s);
		let r = i / 2 - t / 2,
			o = n / 2 - s / 2;
		return window.open(
			e,
			'popup_window',
			'width=' +
				t +
				',height=' +
				s +
				',top=' +
				o +
				',left=' +
				r +
				',resizable,menubar=no'
		);
	}
	class CollectionService extends CrudService {
		get baseCrudPath() {
			return '/api/collections';
		}
		async import(e, t = !1, s) {
			return (
				(s = Object.assign(
					{
						method: 'PUT',
						body: {
							collections: e,
							deleteMissing: t
						}
					},
					s
				)),
				this.client.send(this.baseCrudPath + '/import', s).then(() => !0)
			);
		}
	}
	class LogService extends BaseService {
		getRequestsList(e = 1, t = 30, s) {
			return (
				((s = Object.assign(
					{
						method: 'GET'
					},
					s
				)).query = Object.assign(
					{
						page: e,
						perPage: t
					},
					s.query
				)),
				this.client.send('/api/logs/requests', s)
			);
		}
		getRequest(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'GET'
					},
					t
				)),
				this.client.send('/api/logs/requests/' + encodeURIComponent(e), t)
			);
		}
		getRequestsStats(e) {
			return (
				(e = Object.assign(
					{
						method: 'GET'
					},
					e
				)),
				this.client.send('/api/logs/requests/stats', e)
			);
		}
	}
	class HealthService extends BaseService {
		check(e) {
			return (
				(e = Object.assign(
					{
						method: 'GET'
					},
					e
				)),
				this.client.send('/api/health', e)
			);
		}
	}
	class FileService extends BaseService {
		getUrl(e, t, s = {}) {
			if (!t || !e?.id || (!e?.collectionId && !e?.collectionName)) return '';
			const i = [];
			i.push('api'),
				i.push('files'),
				i.push(encodeURIComponent(e.collectionId || e.collectionName)),
				i.push(encodeURIComponent(e.id)),
				i.push(encodeURIComponent(t));
			let n = this.client.buildUrl(i.join('/'));
			if (Object.keys(s).length) {
				!1 === s.download && delete s.download;
				const e = new URLSearchParams(s);
				n += (n.includes('?') ? '&' : '?') + e;
			}
			return n;
		}
		getToken(e) {
			return (
				(e = Object.assign(
					{
						method: 'POST'
					},
					e
				)),
				this.client.send('/api/files/token', e).then((e) => e?.token || '')
			);
		}
	}
	class BackupService extends BaseService {
		getFullList(e) {
			return (
				(e = Object.assign(
					{
						method: 'GET'
					},
					e
				)),
				this.client.send('/api/backups', e)
			);
		}
		create(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'POST',
						body: {
							name: e
						}
					},
					t
				)),
				this.client.send('/api/backups', t).then(() => !0)
			);
		}
		upload(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'POST',
						body: e
					},
					t
				)),
				this.client.send('/api/backups/upload', t).then(() => !0)
			);
		}
		delete(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'DELETE'
					},
					t
				)),
				this.client
					.send(`/api/backups/${encodeURIComponent(e)}`, t)
					.then(() => !0)
			);
		}
		restore(e, t) {
			return (
				(t = Object.assign(
					{
						method: 'POST'
					},
					t
				)),
				this.client
					.send(`/api/backups/${encodeURIComponent(e)}/restore`, t)
					.then(() => !0)
			);
		}
		getDownloadUrl(e, t) {
			return this.client.buildUrl(
				`/api/backups/${encodeURIComponent(t)}?token=${encodeURIComponent(e)}`
			);
		}
	}
	const i = [
		'requestKey',
		'$cancelKey',
		'$autoCancel',
		'fetch',
		'headers',
		'body',
		'query',
		'params',
		'cache',
		'credentials',
		'headers',
		'integrity',
		'keepalive',
		'method',
		'mode',
		'redirect',
		'referrer',
		'referrerPolicy',
		'signal',
		'window'
	];
	return class Client {
		constructor(e = '/', t, s = 'en-US') {
			(this.cancelControllers = {}),
				(this.recordServices = {}),
				(this.enableAutoCancellation = !0),
				(this.baseUrl = BASEURL),
				(this.lang = s),
				(this.authStore = t || new LocalAuthStore()),
				(this.admins = new AdminService(this)),
				(this.collections = new CollectionService(this)),
				(this.files = new FileService(this)),
				(this.logs = new LogService(this)),
				(this.settings = new SettingsService(this)),
				(this.realtime = new RealtimeService(this)),
				(this.health = new HealthService(this)),
				(this.backups = new BackupService(this));
		}
		collection(e) {
			return (
				this.recordServices[e] ||
					(this.recordServices[e] = new RecordService(this, e)),
				this.recordServices[e]
			);
		}
		autoCancellation(e) {
			return (this.enableAutoCancellation = !!e), this;
		}
		cancelRequest(e) {
			return (
				this.cancelControllers[e] &&
					(this.cancelControllers[e].abort(), delete this.cancelControllers[e]),
				this
			);
		}
		cancelAllRequests() {
			for (let e in this.cancelControllers) this.cancelControllers[e].abort();
			return (this.cancelControllers = {}), this;
		}
		filter(e, t) {
			if (!t) return e;
			for (let s in t) {
				let i = t[s];
				switch (typeof i) {
					case 'boolean':
					case 'number':
						i = '' + i;
						break;
					case 'string':
						i = "'" + i.replace(/'/g, "\\'") + "'";
						break;
					default:
						i =
							null === i
								? 'null'
								: i instanceof Date
									? "'" + i.toISOString().replace('T', ' ') + "'"
									: "'" + JSON.stringify(i).replace(/'/g, "\\'") + "'";
				}
				e = e.replaceAll('{:' + s + '}', i);
			}
			return e;
		}
		getFileUrl(e, t, s = {}) {
			return this.files.getUrl(e, t, s);
		}
		buildUrl(e) {
			let t = this.baseUrl;
			return (
				'undefined' == typeof window ||
					!window.location ||
					t.startsWith('https://') ||
					t.startsWith('http://') ||
					((t = window.location.origin?.endsWith('/')
						? window.location.origin.substring(
								0,
								window.location.origin.length - 1
							)
						: window.location.origin || ''),
					this.baseUrl.startsWith('/') ||
						((t += window.location.pathname || '/'),
						(t += t.endsWith('/') ? '' : '/')),
					(t += this.baseUrl)),
				e &&
					((t += t.endsWith('/') ? '' : '/'),
					(t += e.startsWith('/') ? e.substring(1) : e)),
				t
			);
		}
		async send(e, t) {
			t = this.initSendOptions(e, t);
			let s = this.buildUrl(e);
			if (this.beforeSend) {
				const e = Object.assign({}, await this.beforeSend(s, t));
				void 0 !== e.url || void 0 !== e.options
					? ((s = e.url || s), (t = e.options || t))
					: Object.keys(e).length &&
						((t = e),
						console?.warn &&
							console.warn(
								'Deprecated format of beforeSend return: please use `return { url, options }`, instead of `return options`.'
							));
			}
			if (void 0 !== t.query) {
				const e = this.serializeQueryParams(t.query);
				e && (s += (s.includes('?') ? '&' : '?') + e), delete t.query;
			}
			'application/json' == this.getHeader(t.headers, 'Content-Type') &&
				t.body &&
				'string' != typeof t.body &&
				(t.body = JSON.stringify(t.body));
			return (t.fetch || fetch)(s, t)
				.then(async (e) => {
					let t = {};
					try {
						t = await e.json();
					} catch (e) {}
					if (
						(this.afterSend && (t = await this.afterSend(e, t)),
						e.status >= 400)
					)
						throw new ClientResponseError({
							url: e.url,
							status: e.status,
							data: t
						});
					return t;
				})
				.catch((e) => {
					throw new ClientResponseError(e);
				});
		}
		initSendOptions(e, t) {
			((t = Object.assign(
				{
					method: 'GET'
				},
				t
			)).query = t.query || {}),
				(t.body = this.convertToFormDataIfNeeded(t.body));
			for (let e in t) i.includes(e) || ((t.query[e] = t[e]), delete t[e]);
			if (
				((t.query = Object.assign({}, t.params, t.query)),
				void 0 === t.requestKey &&
					(!1 === t.$autoCancel || !1 === t.query.$autoCancel
						? (t.requestKey = null)
						: (t.$cancelKey || t.query.$cancelKey) &&
							(t.requestKey = t.$cancelKey || t.query.$cancelKey)),
				delete t.$autoCancel,
				delete t.query.$autoCancel,
				delete t.$cancelKey,
				delete t.query.$cancelKey,
				null !== this.getHeader(t.headers, 'Content-Type') ||
					this.isFormData(t.body) ||
					(t.headers = Object.assign({}, t.headers, {
						'Content-Type': 'application/json'
					})),
				null === this.getHeader(t.headers, 'Accept-Language') &&
					(t.headers = Object.assign({}, t.headers, {
						'Accept-Language': this.lang
					})),
				this.authStore.token &&
					null === this.getHeader(t.headers, 'Authorization') &&
					(t.headers = Object.assign({}, t.headers, {
						Authorization: this.authStore.token
					})),
				this.enableAutoCancellation && null !== t.requestKey)
			) {
				const s = t.requestKey || (t.method || 'GET') + e;
				delete t.requestKey, this.cancelRequest(s);
				const i = new AbortController();
				(this.cancelControllers[s] = i), (t.signal = i.signal);
			}
			return t;
		}
		convertToFormDataIfNeeded(e) {
			if (
				'undefined' == typeof FormData ||
				void 0 === e ||
				'object' != typeof e ||
				null === e ||
				this.isFormData(e) ||
				!this.hasBlobField(e)
			)
				return e;
			const t = new FormData();
			for (let s in e) {
				const i = Array.isArray(e[s]) ? e[s] : [e[s]];
				for (let e of i) t.append(s, e);
			}
			return t;
		}
		hasBlobField(e) {
			for (let t in e) {
				const s = Array.isArray(e[t]) ? e[t] : [e[t]];
				for (let e of s)
					if (
						('undefined' != typeof Blob && e instanceof Blob) ||
						('undefined' != typeof File && e instanceof File)
					)
						return !0;
			}
			return !1;
		}
		getHeader(e, t) {
			(e = e || {}), (t = t.toLowerCase());
			for (let s in e) if (s.toLowerCase() == t) return e[s];
			return null;
		}
		isFormData(e) {
			return (
				e &&
				('FormData' === e.constructor.name ||
					('undefined' != typeof FormData && e instanceof FormData))
			);
		}
		serializeQueryParams(e) {
			const t = [];
			for (const s in e) {
				if (null === e[s]) continue;
				const i = e[s],
					n = encodeURIComponent(s);
				if (Array.isArray(i))
					for (const e of i) t.push(n + '=' + encodeURIComponent(e));
				else
					i instanceof Date
						? t.push(n + '=' + encodeURIComponent(i.toISOString()))
						: null !== typeof i && 'object' == typeof i
							? t.push(n + '=' + encodeURIComponent(JSON.stringify(i)))
							: t.push(n + '=' + encodeURIComponent(i));
			}
			return t.join('&');
		}
	};
});

export default PocketBase;

//# sourceMappingURL=pb.js.map
