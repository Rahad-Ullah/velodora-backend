"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    //searching
    search(searchableFields) {
        var _a;
        if ((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(field => ({
                    [field]: {
                        $regex: this.query.searchTerm,
                        $options: 'i',
                    },
                })),
            });
        }
        return this;
    }
    //filtering
    // User.find({ role: 'USER', isActive: true })
    filter() {
        const queryObj = Object.assign({}, this.query);
        const excludeFields = ['searchTerm', 'sort', 'page', 'limit', 'fields'];
        excludeFields.forEach(element => delete queryObj[element]);
        this.modelQuery = this.modelQuery.find(queryObj);
        return this;
    }
    //sorting
    sort(sortableFields) {
        let newSort = [];
        if (sortableFields && (sortableFields === null || sortableFields === void 0 ? void 0 : sortableFields.length) > 0) {
            newSort = sortableFields;
        }
        else {
            newSort = ["-createdAt"];
        }
        const sortArray = [];
        newSort.forEach(field => {
            const isDescending = field.trim().startsWith("-");
            const fieldName = isDescending ? field.slice(1) : field;
            sortArray.push([fieldName, isDescending ? "desc" : "asc"]);
        });
        this.modelQuery = this.modelQuery.sort(sortArray);
        return this;
    }
    //pagination
    paginate() {
        var _a, _b;
        let limit = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.limit) || 10;
        let page = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.page) || 1;
        let skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    //fields filtering
    //"fields filtering": "name,email,location, ...."
    // User.find().select("name email location");
    fields() {
        var _a, _b;
        let fields = ((_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.split(",").join(" ")) || "-__v";
        // Always exclude password
        const result = fields.replace(/\bpassword\b/, "").replace(/\s+/g, " ").trim();
        this.modelQuery = this.modelQuery.select(result);
        return this;
    }
    //populating
    // .populate(['profile', 'orders'], { profile: 'bio age', orders: 'amount' })
    // User.find().populate([
    //   { path: 'profile', select: 'bio age' },
    //   { path: 'orders', select: 'amount' }
    // ]);
    populate(populateFields, selectFields) {
        this.modelQuery = this.modelQuery.populate(populateFields.map(field => ({
            path: field,
            select: selectFields[field],
        })));
        return this;
    }
    //pagination information
    getPaginationInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const total = yield this.modelQuery.model.countDocuments(this.modelQuery.getFilter());
            const limit = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.limit) || 10;
            const page = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.page) || 1;
            const totalPage = Math.ceil(total / limit);
            return {
                total,
                limit,
                page,
                totalPage,
            };
        });
    }
}
exports.default = QueryBuilder;
