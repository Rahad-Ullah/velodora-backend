
import { model, Schema } from 'mongoose';
import { IFavList, IFavListModal } from './favList.interface';

const subCategorySchema = new Schema<IFavList, IFavListModal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Provider',
      required: true,
    }
  },
  { timestamps: true }
);


export const FavListModel = model<IFavList, IFavListModal>('FavList', subCategorySchema);
