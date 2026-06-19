"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/sellers/dashboard/route";
exports.ids = ["app/api/sellers/dashboard/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Fdashboard%2Froute&page=%2Fapi%2Fsellers%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Fdashboard%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Fdashboard%2Froute&page=%2Fapi%2Fsellers%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Fdashboard%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_DOWNLOADS_sistema_envio_msg_render_corrigido_sistema_envio_msg_render_fixed_sistema_envio_msg_render_fixed_frontend_app_api_sellers_dashboard_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/sellers/dashboard/route.js */ \"(rsc)/./app/api/sellers/dashboard/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/sellers/dashboard/route\",\n        pathname: \"/api/sellers/dashboard\",\n        filename: \"route\",\n        bundlePath: \"app/api/sellers/dashboard/route\"\n    },\n    resolvedPagePath: \"D:\\\\DOWNLOADS\\\\sistema_envio_msg_render_corrigido\\\\sistema_envio_msg_render_fixed\\\\sistema_envio_msg_render_fixed\\\\frontend\\\\app\\\\api\\\\sellers\\\\dashboard\\\\route.js\",\n    nextConfigOutput,\n    userland: D_DOWNLOADS_sistema_envio_msg_render_corrigido_sistema_envio_msg_render_fixed_sistema_envio_msg_render_fixed_frontend_app_api_sellers_dashboard_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/sellers/dashboard/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzZWxsZXJzJTJGZGFzaGJvYXJkJTJGcm91dGUmcGFnZT0lMkZhcGklMkZzZWxsZXJzJTJGZGFzaGJvYXJkJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGc2VsbGVycyUyRmRhc2hib2FyZCUyRnJvdXRlLmpzJmFwcERpcj1EJTNBJTVDRE9XTkxPQURTJTVDc2lzdGVtYV9lbnZpb19tc2dfcmVuZGVyX2NvcnJpZ2lkbyU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q2Zyb250ZW5kJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1EJTNBJTVDRE9XTkxPQURTJTVDc2lzdGVtYV9lbnZpb19tc2dfcmVuZGVyX2NvcnJpZ2lkbyU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q2Zyb250ZW5kJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNtSDtBQUNoTTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3Npc3RlbWEtbXNnLz8xOTA2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXERPV05MT0FEU1xcXFxzaXN0ZW1hX2VudmlvX21zZ19yZW5kZXJfY29ycmlnaWRvXFxcXHNpc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZFxcXFxzaXN0ZW1hX2VudmlvX21zZ19yZW5kZXJfZml4ZWRcXFxcZnJvbnRlbmRcXFxcYXBwXFxcXGFwaVxcXFxzZWxsZXJzXFxcXGRhc2hib2FyZFxcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvc2VsbGVycy9kYXNoYm9hcmQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9zZWxsZXJzL2Rhc2hib2FyZFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc2VsbGVycy9kYXNoYm9hcmQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJEOlxcXFxET1dOTE9BRFNcXFxcc2lzdGVtYV9lbnZpb19tc2dfcmVuZGVyX2NvcnJpZ2lkb1xcXFxzaXN0ZW1hX2VudmlvX21zZ19yZW5kZXJfZml4ZWRcXFxcc2lzdGVtYV9lbnZpb19tc2dfcmVuZGVyX2ZpeGVkXFxcXGZyb250ZW5kXFxcXGFwcFxcXFxhcGlcXFxcc2VsbGVyc1xcXFxkYXNoYm9hcmRcXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3NlbGxlcnMvZGFzaGJvYXJkL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Fdashboard%2Froute&page=%2Fapi%2Fsellers%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Fdashboard%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/sellers/dashboard/route.js":
/*!********************************************!*\
  !*** ./app/api/sellers/dashboard/route.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../lib/db */ \"(rsc)/./lib/db.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lib_db__WEBPACK_IMPORTED_MODULE_1__);\n\n\nasync function GET(request) {\n    const { searchParams } = new URL(request.url);\n    const start = searchParams.get(\"start\");\n    const end = searchParams.get(\"end\");\n    try {\n        let dateFilter = \"\";\n        const params = [];\n        if (start && end) {\n            dateFilter = \"AND l.created_at >= $1 AND l.created_at <= $2::timestamp + interval '1 day'\";\n            params.push(start, end);\n        }\n        const query = `\n            SELECT \n                s.id, \n                s.name, \n                s.photo_base64,\n                COUNT(l.id) as total_chats,\n                COUNT(l.answered_at) as answered_chats,\n                AVG(l.response_time) as avg_response_time\n            FROM sellers s\n            LEFT JOIN leads_monitoring l ON s.attendant_id = l.attendant_id ${dateFilter}\n            GROUP BY s.id, s.name, s.photo_base64\n            ORDER BY avg_response_time ASC NULLS LAST\n        `;\n        const result = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.pgPool.query(query, params);\n        // Convert avg_response_time to number\n        const mapped = result.rows.map((r)=>({\n                ...r,\n                total_chats: parseInt(r.total_chats, 10),\n                answered_chats: parseInt(r.answered_chats, 10),\n                avg_response_time: r.avg_response_time ? parseFloat(r.avg_response_time) : null\n            }));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(mapped);\n    } catch (error) {\n        console.error(\"Error fetching sellers dashboard:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal Server Error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NlbGxlcnMvZGFzaGJvYXJkL3JvdXRlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBMkM7QUFDQztBQUVyQyxlQUFlRSxJQUFJQyxPQUFPO0lBQzdCLE1BQU0sRUFBRUMsWUFBWSxFQUFFLEdBQUcsSUFBSUMsSUFBSUYsUUFBUUcsR0FBRztJQUM1QyxNQUFNQyxRQUFRSCxhQUFhSSxHQUFHLENBQUM7SUFDL0IsTUFBTUMsTUFBTUwsYUFBYUksR0FBRyxDQUFDO0lBRTdCLElBQUk7UUFDQSxJQUFJRSxhQUFhO1FBQ2pCLE1BQU1DLFNBQVMsRUFBRTtRQUNqQixJQUFJSixTQUFTRSxLQUFLO1lBQ2RDLGFBQWE7WUFDYkMsT0FBT0MsSUFBSSxDQUFDTCxPQUFPRTtRQUN2QjtRQUVBLE1BQU1JLFFBQVEsQ0FBQzs7Ozs7Ozs7OzRFQVNxRCxFQUFFSCxXQUFXOzs7UUFHakYsQ0FBQztRQUVELE1BQU1JLFNBQVMsTUFBTWIsMkNBQU1BLENBQUNZLEtBQUssQ0FBQ0EsT0FBT0Y7UUFFekMsc0NBQXNDO1FBQ3RDLE1BQU1JLFNBQVNELE9BQU9FLElBQUksQ0FBQ0MsR0FBRyxDQUFDQyxDQUFBQSxJQUFNO2dCQUNqQyxHQUFHQSxDQUFDO2dCQUNKQyxhQUFhQyxTQUFTRixFQUFFQyxXQUFXLEVBQUU7Z0JBQ3JDRSxnQkFBZ0JELFNBQVNGLEVBQUVHLGNBQWMsRUFBRTtnQkFDM0NDLG1CQUFtQkosRUFBRUksaUJBQWlCLEdBQUdDLFdBQVdMLEVBQUVJLGlCQUFpQixJQUFJO1lBQy9FO1FBRUEsT0FBT3RCLHFEQUFZQSxDQUFDd0IsSUFBSSxDQUFDVDtJQUM3QixFQUFFLE9BQU9VLE9BQU87UUFDWkMsUUFBUUQsS0FBSyxDQUFDLHFDQUFxQ0E7UUFDbkQsT0FBT3pCLHFEQUFZQSxDQUFDd0IsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBd0IsR0FBRztZQUFFRSxRQUFRO1FBQUk7SUFDL0U7QUFDSiIsInNvdXJjZXMiOlsid2VicGFjazovL3Npc3RlbWEtbXNnLy4vYXBwL2FwaS9zZWxsZXJzL2Rhc2hib2FyZC9yb3V0ZS5qcz85Y2RmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IHBnUG9vbCB9IGZyb20gJy4uLy4uLy4uLy4uL2xpYi9kYic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdCkge1xuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAgICBjb25zdCBzdGFydCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3N0YXJ0Jyk7XG4gICAgY29uc3QgZW5kID0gc2VhcmNoUGFyYW1zLmdldCgnZW5kJyk7XG5cbiAgICB0cnkge1xuICAgICAgICBsZXQgZGF0ZUZpbHRlciA9ICcnO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBbXTtcbiAgICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICAgICAgZGF0ZUZpbHRlciA9ICdBTkQgbC5jcmVhdGVkX2F0ID49ICQxIEFORCBsLmNyZWF0ZWRfYXQgPD0gJDI6OnRpbWVzdGFtcCArIGludGVydmFsIFxcJzEgZGF5XFwnJztcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKHN0YXJ0LCBlbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSBgXG4gICAgICAgICAgICBTRUxFQ1QgXG4gICAgICAgICAgICAgICAgcy5pZCwgXG4gICAgICAgICAgICAgICAgcy5uYW1lLCBcbiAgICAgICAgICAgICAgICBzLnBob3RvX2Jhc2U2NCxcbiAgICAgICAgICAgICAgICBDT1VOVChsLmlkKSBhcyB0b3RhbF9jaGF0cyxcbiAgICAgICAgICAgICAgICBDT1VOVChsLmFuc3dlcmVkX2F0KSBhcyBhbnN3ZXJlZF9jaGF0cyxcbiAgICAgICAgICAgICAgICBBVkcobC5yZXNwb25zZV90aW1lKSBhcyBhdmdfcmVzcG9uc2VfdGltZVxuICAgICAgICAgICAgRlJPTSBzZWxsZXJzIHNcbiAgICAgICAgICAgIExFRlQgSk9JTiBsZWFkc19tb25pdG9yaW5nIGwgT04gcy5hdHRlbmRhbnRfaWQgPSBsLmF0dGVuZGFudF9pZCAke2RhdGVGaWx0ZXJ9XG4gICAgICAgICAgICBHUk9VUCBCWSBzLmlkLCBzLm5hbWUsIHMucGhvdG9fYmFzZTY0XG4gICAgICAgICAgICBPUkRFUiBCWSBhdmdfcmVzcG9uc2VfdGltZSBBU0MgTlVMTFMgTEFTVFxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBnUG9vbC5xdWVyeShxdWVyeSwgcGFyYW1zKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbnZlcnQgYXZnX3Jlc3BvbnNlX3RpbWUgdG8gbnVtYmVyXG4gICAgICAgIGNvbnN0IG1hcHBlZCA9IHJlc3VsdC5yb3dzLm1hcChyID0+ICh7XG4gICAgICAgICAgICAuLi5yLFxuICAgICAgICAgICAgdG90YWxfY2hhdHM6IHBhcnNlSW50KHIudG90YWxfY2hhdHMsIDEwKSxcbiAgICAgICAgICAgIGFuc3dlcmVkX2NoYXRzOiBwYXJzZUludChyLmFuc3dlcmVkX2NoYXRzLCAxMCksXG4gICAgICAgICAgICBhdmdfcmVzcG9uc2VfdGltZTogci5hdmdfcmVzcG9uc2VfdGltZSA/IHBhcnNlRmxvYXQoci5hdmdfcmVzcG9uc2VfdGltZSkgOiBudWxsXG4gICAgICAgIH0pKTtcblxuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24obWFwcGVkKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBzZWxsZXJzIGRhc2hib2FyZDonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyB9LCB7IHN0YXR1czogNTAwIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJwZ1Bvb2wiLCJHRVQiLCJyZXF1ZXN0Iiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwic3RhcnQiLCJnZXQiLCJlbmQiLCJkYXRlRmlsdGVyIiwicGFyYW1zIiwicHVzaCIsInF1ZXJ5IiwicmVzdWx0IiwibWFwcGVkIiwicm93cyIsIm1hcCIsInIiLCJ0b3RhbF9jaGF0cyIsInBhcnNlSW50IiwiYW5zd2VyZWRfY2hhdHMiLCJhdmdfcmVzcG9uc2VfdGltZSIsInBhcnNlRmxvYXQiLCJqc29uIiwiZXJyb3IiLCJjb25zb2xlIiwic3RhdHVzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/sellers/dashboard/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/db.js":
/*!*******************!*\
  !*** ./lib/db.js ***!
  \*******************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst { Pool } = __webpack_require__(/*! pg */ \"pg\");\nif (!process.env.DATABASE_URL) {\n    (__webpack_require__(/*! dotenv */ \"(rsc)/./node_modules/dotenv/lib/main.js\").config)({\n        path: \".env.local\"\n    });\n    (__webpack_require__(/*! dotenv */ \"(rsc)/./node_modules/dotenv/lib/main.js\").config)(); // fallback\n}\nlet pgPool;\nif (process.env.DATABASE_URL) {\n    pgPool = new Pool({\n        connectionString: process.env.DATABASE_URL\n    });\n} else {\n    console.warn(\"DATABASE_URL not found in environment\");\n}\nmodule.exports = {\n    pgPool\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIuanMiLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sRUFBRUEsSUFBSSxFQUFFLEdBQUdDLG1CQUFPQSxDQUFDO0FBRXpCLElBQUksQ0FBQ0MsUUFBUUMsR0FBRyxDQUFDQyxZQUFZLEVBQUU7SUFDM0JILHFGQUF3QixDQUFDO1FBQUVLLE1BQU07SUFBYTtJQUM5Q0wscUZBQXdCLElBQUksV0FBVztBQUMzQztBQUVBLElBQUlNO0FBRUosSUFBSUwsUUFBUUMsR0FBRyxDQUFDQyxZQUFZLEVBQUU7SUFDMUJHLFNBQVMsSUFBSVAsS0FBSztRQUNkUSxrQkFBa0JOLFFBQVFDLEdBQUcsQ0FBQ0MsWUFBWTtJQUM5QztBQUNKLE9BQU87SUFDSEssUUFBUUMsSUFBSSxDQUFDO0FBQ2pCO0FBRUFDLE9BQU9DLE9BQU8sR0FBRztJQUFFTDtBQUFPIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc2lzdGVtYS1tc2cvLi9saWIvZGIuanM/M2RjOSJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IFBvb2wgfSA9IHJlcXVpcmUoJ3BnJyk7XG5cbmlmICghcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMKSB7XG4gICAgcmVxdWlyZSgnZG90ZW52JykuY29uZmlnKHsgcGF0aDogJy5lbnYubG9jYWwnIH0pO1xuICAgIHJlcXVpcmUoJ2RvdGVudicpLmNvbmZpZygpOyAvLyBmYWxsYmFja1xufVxuXG5sZXQgcGdQb29sO1xuXG5pZiAocHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMKSB7XG4gICAgcGdQb29sID0gbmV3IFBvb2woe1xuICAgICAgICBjb25uZWN0aW9uU3RyaW5nOiBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwsXG4gICAgfSk7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybignREFUQUJBU0VfVVJMIG5vdCBmb3VuZCBpbiBlbnZpcm9ubWVudCcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgcGdQb29sIH07XG4iXSwibmFtZXMiOlsiUG9vbCIsInJlcXVpcmUiLCJwcm9jZXNzIiwiZW52IiwiREFUQUJBU0VfVVJMIiwiY29uZmlnIiwicGF0aCIsInBnUG9vbCIsImNvbm5lY3Rpb25TdHJpbmciLCJjb25zb2xlIiwid2FybiIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/dotenv"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Fdashboard%2Froute&page=%2Fapi%2Fsellers%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Fdashboard%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();