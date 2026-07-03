"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReceiptValue = exports.normalizeImageUrls = void 0;
var normalizeImageUrls = function (value) {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.filter(function (item) { return Boolean(item); });
    if (typeof value === "string") {
        try {
            var parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.filter(function (item) { return Boolean(item); });
            }
        }
        catch (_a) {
            // ignore invalid JSON and fall back to comma split
        }
        return value
            .split(",")
            .map(function (item) { return item.trim(); })
            .filter(Boolean);
    }
    return [];
};
exports.normalizeImageUrls = normalizeImageUrls;
var buildReceiptValue = function (images) {
    if (!images.length)
        return null;
    return images.length === 1 ? images[0] : JSON.stringify(images);
};
exports.buildReceiptValue = buildReceiptValue;
