package mediachooser.fragment;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.AdapterView.OnItemLongClickListener;
import android.widget.GridView;
import android.widget.Toast;
import com.synconset.FakeR;
import mediachooser.MediaChooserConstants;
import mediachooser.MediaModel;
import mediachooser.adapter.GridViewAdapter;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;


public class ImageFragment extends Fragment {
	private ArrayList<String> mSelectedItems = new ArrayList<String>();
	private HashMap<String, Integer> fileNames = new HashMap<String, Integer>();
	private ArrayList<MediaModel> mGalleryModelList;
	private GridView mImageGridView;
	private View mView;
	private OnImageSelectedListener mCallback;
	private GridViewAdapter mImageAdapter;
	private Cursor mImageCursor;


	// Container Activity must implement this interface
	public interface OnImageSelectedListener {
		public void onImageSelected(int count);
	}

	@Override
	public void onAttach(Activity activity) {
		super.onAttach(activity);

		// This makes sure that the container activity has implemented
		// the callback interface. If not, it throws an exception
		try {
			mCallback = (OnImageSelectedListener) activity;
		} catch (ClassCastException e) {
			throw new ClassCastException(activity.toString() + " must implement OnImageSelectedListener");
		}
	}

	public ImageFragment(){
		setRetainInstance(true);
	}


	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {

		if(mView == null){
			mView = inflater.inflate(getRLayoutId("view_grid_layout_media_chooser"), container, false);

			mImageGridView = (GridView) mView.findViewById(getRIntId("gridViewFromMediaChooser"));


			if (getArguments() != null) {
				initPhoneImages(getArguments().getString("name"));
			}else{
				initPhoneImages();
			}

		}else{
			((ViewGroup) mView.getParent()).removeView(mView);
			if(mImageAdapter == null || mImageAdapter.getCount() == 0){
				Toast.makeText(getActivity(), getActivity().getString(getRStringId("no_media_file_available")), Toast.LENGTH_SHORT).show();
			}
		}

		return mView;
	}


	private void initPhoneImages(String bucketName){
		try {
			final String orderBy = MediaStore.Images.Media.DATE_TAKEN;
			String searchParams = null;
			String bucket = bucketName;
			searchParams = "bucket_display_name = \"" + bucket + "\"";

			final String[] columns = { MediaStore.Images.Media.DATA, MediaStore.Images.Media._ID,MediaStore.Images.Media.ORIENTATION};
			mImageCursor = getActivity().getContentResolver().query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, columns, searchParams, null, orderBy + " DESC");

			setAdapter(mImageCursor);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void initPhoneImages() {
		try {
			final String orderBy = MediaStore.Images.Media.DATE_TAKEN;
			final String[] columns = { MediaStore.Images.Media.DATA, MediaStore.Images.Media._ID,MediaStore.Images.Media.ORIENTATION};
			mImageCursor = getActivity().getContentResolver().query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, columns, null, null, orderBy + " DESC");

			setAdapter(mImageCursor);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}


	private void setAdapter(Cursor imagecursor) {

		if(imagecursor.getCount() > 0){

			mGalleryModelList = new ArrayList<MediaModel>();

			for (int i = 0; i < imagecursor.getCount(); i++) {
				imagecursor.moveToPosition(i);
				int dataColumnIndex       = imagecursor.getColumnIndex(MediaStore.Images.Media.DATA);
				int orientationColumnIndex       = imagecursor.getColumnIndex(MediaStore.Images.Media.ORIENTATION);
				MediaModel galleryModel   = new MediaModel(imagecursor.getString(dataColumnIndex).toString(), false, imagecursor.getInt(orientationColumnIndex));
				mGalleryModelList.add(galleryModel);
			}


			mImageAdapter = new GridViewAdapter(getActivity(), 0, mGalleryModelList, false);
			mImageGridView.setAdapter(mImageAdapter);
		}else{
			Toast.makeText(getActivity(), getActivity().getString(getRStringId("no_media_file_available")), Toast.LENGTH_SHORT).show();
		}
		
		mImageGridView.setOnItemLongClickListener(new OnItemLongClickListener() {

			@Override
			public boolean onItemLongClick(AdapterView<?> parent, View view, int position, long id) {
				
				GridViewAdapter adapter = (GridViewAdapter) parent.getAdapter();
				MediaModel galleryModel = (MediaModel) adapter.getItem(position);
				File file = new File(galleryModel.url);
				Intent intent = new Intent(Intent.ACTION_VIEW);
				intent.setDataAndType(Uri.fromFile(file), "image/*");
				startActivity(intent);
				return true;
			}
		});

		mImageGridView.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> parent,
					View view, int position, long id) {
				// update the mStatus of each category in the adapter
				GridViewAdapter adapter = (GridViewAdapter) parent.getAdapter();
				MediaModel galleryModel = (MediaModel) adapter.getItem(position);


				if(! galleryModel.status){
					long size = MediaChooserConstants.ChekcMediaFileSize(new File(galleryModel.url.toString()), false);
					if(size != 0){
						Toast.makeText(getActivity(), getActivity().getResources().getString(getRStringId("file_size_exceeded")) + " " + MediaChooserConstants.SELECTED_IMAGE_SIZE_IN_MB + " " +  getActivity().getResources().getString(getRStringId("mb")), Toast.LENGTH_SHORT).show();
						return;
					}

					if((MediaChooserConstants.MAX_MEDIA_LIMIT == MediaChooserConstants.SELECTED_MEDIA_COUNT)){
						if (MediaChooserConstants.SELECTED_MEDIA_COUNT < 2) {
							Toast.makeText(getActivity(), getActivity().getResources().getString(getRStringId("max_limit_file")) + " " + MediaChooserConstants.SELECTED_MEDIA_COUNT + " " +  getActivity().getResources().getString(getRStringId("files")), Toast.LENGTH_SHORT).show();
							return;
						} else {
							Toast.makeText(getActivity(), getActivity().getResources().getString(getRStringId("max_limit_file")) + " " + MediaChooserConstants.SELECTED_MEDIA_COUNT + " " +  getActivity().getResources().getString(getRStringId("files")), Toast.LENGTH_SHORT).show();
							return;
						}

					}
				}

				// inverse the status
				galleryModel.status = ! galleryModel.status;

				adapter.notifyDataSetChanged();

				if (galleryModel.status) {
					mSelectedItems.add(galleryModel.url.toString());
					fileNames.put(galleryModel.url,galleryModel.orientation);
					MediaChooserConstants.SELECTED_MEDIA_COUNT ++;

				}else{
					mSelectedItems.remove(galleryModel.url.toString().trim());
					fileNames.remove(galleryModel.url);
					MediaChooserConstants.SELECTED_MEDIA_COUNT --;
				}

				if (mCallback != null) {
					mCallback.onImageSelected(mSelectedItems.size());
					Intent intent = new Intent();
					intent.putStringArrayListExtra("list", mSelectedItems);
					intent.putExtra("map", fileNames);
					getActivity().setResult(Activity.RESULT_OK, intent);
				}

			}
		});
	}

	public ArrayList<String> getSelectedImageList() {
		return mSelectedItems;
	}
	public HashMap<String, Integer> getSelectedMapList() {
		return fileNames;
	}

	public void addItem(String item) {
		if(mImageAdapter != null){
			MediaModel model = new MediaModel(item, false,90);
			mGalleryModelList.add(0, model);
			mImageAdapter.notifyDataSetChanged();
		}else{
			initPhoneImages();
		}
	}

	public int getRStringId(String resourceId){
		return FakeR.getId(getActivity(), "string", resourceId);
	}

	public int getRIntId(String resourceId){
		return FakeR.getId(getActivity(), "id", resourceId);
	}

	public int getRColorId(String resourceId){
		return FakeR.getId(getActivity(), "color", resourceId);
	}

	public int getRDrawableId(String resourceId){
		return FakeR.getId(getActivity(), "drawable", resourceId);
	}
	public int getRLayoutId(String resourceId){
		return FakeR.getId(getActivity(), "layout", resourceId);
	}

}
