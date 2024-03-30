import { GM_getValue } from '$';
import { useRef } from 'preact/hooks';
import { GM_STORE_NICKNAMEMAPKEY } from '../config';

const BlockerUserList = ({
  blcokerUserSet,
  removeFromBlocker,
  onClose,
}: {
  blcokerUserSet: Set<number>;
  removeFromBlocker: (e: MouseEvent, userId: number) => void;
  onClose: () => void;
}) => {
  const blockerUserArray = Array.from(blcokerUserSet);
  const nickNameMap = useRef<Map<number, string>>(
    new Map(JSON.parse(GM_getValue(GM_STORE_NICKNAMEMAPKEY, '[]')))
  );

  const contentNode =
    blockerUserArray.length > 0 ? (
      <table>
        <thead>
          <th>用户ID</th>
          <th>昵称</th>
          <th>操作</th>
        </thead>

        <tbody>
          {blockerUserArray.map((userId) => (
            <tr key={userId}>
              <td>{userId}</td>
              <td>{nickNameMap.current.get(userId)}</td>
              <td>
                <button onClick={(e) => removeFromBlocker(e, userId)}>
                  移除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      '当前没有用户被屏蔽'
    );

  return (
    <>
      <div className='myblockerList'>{contentNode}</div>
      <button className='myCloseBtn' onClick={onClose}>
        关闭
      </button>
    </>
  );
};

export default BlockerUserList;
